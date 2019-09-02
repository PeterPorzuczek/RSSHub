const got = require('@/utils/got');
const cheerio = require('cheerio');

function findPropertyByKeyPrefix(state, value) {
    const result = [];

    for (const key in state) {
        if (key.startsWith(value)) {
            result.push(state[key]);
        }
    }

    return result;
}

function createImageUrlFromId(id) {
    return `https://ph-files.imgix.net/${id}?auto=format&auto=compress&codec=mozjpeg&cs=strip&min-w=240&min-h=120&fit=fill&fill=solid&fill-color=360036&w=240&h=120`.replace(/\n/g, '');
}

function isDateInValid(date) {
    return date.toString() === 'Invalid Date';
}

function createDateFromIteration(dateAsText, index) {
    let date = new Date(`${dateAsText} 12:00:00`).toUTCString();
    date = isDateInValid(date) ? new Date() : date;
    date = date.getTime ? new Date(date.getTime() - 1000 * index) : date;

    return date;
}

module.exports = {
    getData: async (name, url) => {
        const response = await got({
            method: 'get',
            url: url,
            headers: {
                Referer: url,
            },
        });

        const state = JSON.parse(response.data.match(/window.__APOLLO_STATE__ = (.*);<\/script>/)[1]) || {};
        const posts = findPropertyByKeyPrefix(state, 'Post');
        const data = response.data;

        const $ = cheerio.load(data);

        const postsParsed = posts
            .filter((item) => {
                const timeDiffernece = new Date().getTime() - new Date(item.featured_at).getTime();
                const timeToCheck = 60 * 60 * 1000 * 24 * 2;

                return timeDiffernece < timeToCheck;
            })
            .map((item, index) => ({
                title: `${item.name} - ${item.tagline}`,
                description: `<img
                        src="${createImageUrlFromId(state[item.thumbnail.id].image_uuid)}">
                        <br>
                        <p>
                            ${item.tagline}
                        </p>`,
                link: `${url}/posts/${item.slug}`,
                pubDate: createDateFromIteration(item.updated_at, index),
            }));

        return {
            title: `${name} - Product Hunt`,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item: postsParsed,
        };
    },
};
