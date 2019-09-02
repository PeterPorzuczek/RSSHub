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
        const list = $('ol.dribbbles.group li.group');

        return {
            title: `${name} - Dribbble`,
            link: url,
            description: $('meta[name="description"]').attr('content'),
            item:
                list &&
                list
                    .map((index, item) => {
                        item = $(item);

                        return {
                            title: item.find('.dribbble-over strong').text(),
                            description: `<img src="${item
                                .find('.dribbble-link img')
                                .attr('src')
                                .replace('_teaser', '')}"><br>
                                ${item.find('.comment').text()}<br>
                                <strong>Author:</strong> ${item.find('.attribution-team') ? item.find('.attribution-team').text() + ' -' : ''}${item.find('.attribution-user').text()}<br>
                                <strong>Views:</strong> ${item.find('.views').text()}<br>
                                <strong>Comment:</strong> ${item.find('.cmnt').text()}<br>
                                <strong>Favor:</strong> ${item.find('.fav').text()}`,
                            link: `https://dribbble.com${item.find('.animated-target').attr('href') ||
                                item
                                    .find('.extras > a')
                                    .attr('href')
                                    .replace('/rebounds', '')}`,
                            pubDate: createDateFromIteration(item.find('.timestamp').text(), index),
                        };
                    })
                    .get(),
        };
    },
};
