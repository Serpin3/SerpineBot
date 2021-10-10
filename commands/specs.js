const fetch = require('node-fetch');
const cheerio = require('cheerio');
const UserAgent = require('user-agents');
const { erase } = require('../utils/message');

module.exports = {
    name: 'specs',
    async getGameSpecs(message, args) {
        erase(message, 5000);

        const query = args.slice(1).join(' ');
        if(!query) return message.channel.send('./cmd specs');

        const { name, url, image } = await this.searchGameSpecs(query);
        if(!url) return message.channel.send(`Couldn\'t find a match for ${query}.`).then(m => { m.delete({ timeout: 5000 }) });

        const res = await fetch(`https://www.game-debate.com${url}`, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        const releaseDate = $('.game-release-date-container .game-release-date p').next().text().trim();
        const updatedDate = $('.devDefSysReqMinWrapper .dateUpdated').first().text().split('-')[0].trim();

        const minSpecs = [];
        $('.devDefSysReqMinWrapper .devDefSysReqList li').each((i, element) => {
            const line = $(element).clone().children().remove().end().text().trim();
            const category = line.includes(':') ? line.slice(0, line.indexOf(':')).trim() : null;
            const requirement = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : null;
            const spec = category && requirement ? `**${category}**: ${requirement}` : line;

            minSpecs.push(spec);
        });	

        const recSpecs = [];
        $('.devDefSysReqRecWrapper .devDefSysReqList li').each((i, element) => {
            const line = $(element).clone().children().remove().end().text().trim();
            const category = line.includes(':') ? line.slice(0, line.indexOf(':')).trim() : null;
            const requirement = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : null;
            const spec = category && requirement ? `**${category}**: ${requirement}` : line;

            recSpecs.push(spec);
        });
        
        if(minSpecs.length === 0) minSpecs.push('No minimum requirements available.');
        if(recSpecs.length === 0) recSpecs.push('No recommended requirements available.');

        message.channel.send({ embed: {
            color: Math.floor(Math.random() * 16777214) + 1,
            title: `Requirements found for \`${name}\``,
            description: `
                \n**Release Date:** ${releaseDate.length > 0 ? releaseDate : 'N/A'}
                \n**Specs updated:** ${updatedDate.length > 0 ? updatedDate : 'N/A'}
                \n**Minimum requirements**\n${minSpecs.join('\n')}
                \n**Recommended requirements**\n${recSpecs.join('\n')}`,
            thumbnail: {
                url: image ? image : ''
            }
        }});	
    },
    async searchGameSpecs(game) {
        const res = await fetch(`https://www.game-debate.com/search/games?t=games&query=${game}`, { headers: { 'User-Agent': new UserAgent().toString() } });
        const html = await res.text();
        const $ = cheerio.load(html);

        return {
            name: $('.search-results-body .search-result-detail h2').first().text(),
            url: $('.search-results-body a').first().attr('href'), 
            image: $('.search-results-body .search-result-image img').first().attr('src') 
        };
    }	
}