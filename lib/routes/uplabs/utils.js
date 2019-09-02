const got = require('@/utils/got');
const cheerio = require('cheerio');

function createDateFromIteration(index) {
    let date = new Date();
    date = new Date(date.getTime() - 1000 * index);

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
            pubDate: createDateFromIteration(index),
        }));

        return {
            title: `${name} - Uplabs`,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item: postsParsed,
        };
    },
};
