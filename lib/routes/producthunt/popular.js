const utils = require('./utils');

module.exports = async (ctx) => {
    const name = 'Popular';

    ctx.state.data = await utils.getData(name, `https://www.producthunt.com`);
};
