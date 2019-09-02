const got = require('@/utils/got');
const cheerio = require('cheerio');

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

        const data = response.data;

        const $ = cheerio.load(data);
        const state = $('[data-react-class=CategoryList]').attr('data-react-props');

        const postsParsed = JSON.parse(`${state}`).posts.map((item, index) => ({
            title: `${item.name}`,
            description: `<img
                src="${item.teaser_url}">
                <br>
                <p>
                    ${item.name}
                </p>`,
            link: `${item.link_url}`,
            pubDate: createDateFromIteration(item.showcased_at, index),
        }));

        return {
            title: `${name} - Uplabs`,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item: postsParsed,
        };
    },
};
