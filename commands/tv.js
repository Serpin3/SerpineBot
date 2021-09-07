const fetch = require('node-fetch');

module.exports = {
	name: 'tv',
    minutesToHours(time) {
        const hours = Math.floor(time / 60).toString();          
        const minutes = (time % 60).toString().padStart(2,'0');

        return `${hours}h${minutes}m`;
    },
    async getTVShows(message, args) {
        message.delete({ timeout: 5000 });

        const show_query = args.slice(1).join(' ');
        if(!show_query) return message.channel.send('./cmd tv');
        try {
            const id = await this.searchTVShow(show_query);
            if(!id) return message.channel.send(`Couldn't find a match for ${show_query}.`).then(m => { m.delete({ timeout: 5000 }) });

            const { name, tagline, overview, url, status, firstEpisode, nextEpisode, seasons, image, score, runtime, genres, providers } = await this.getTVShowDetails(id);

            message.channel.send({ embed: {
                color: Math.floor(Math.random() * 16777214) + 1,
                title: name,
                url,
                description: `
                    ${tagline ? `*${tagline}*` : ''}
                    \n${overview ? overview : ''}
                `,
                fields: [
                    {
                        name: '**Status**',
                        value: status ? status : 'N/A'
                    },
                    {
                        name: '**First Episode**',
                        value: firstEpisode ? firstEpisode : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Next Episode**',
                        value: nextEpisode ? nextEpisode : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Seasons**',
                        value: seasons ? seasons : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Score**',
                        value: score ? score : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Runtime**',
                        value: runtime ? runtime : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Genres**',
                        value: genres.length > 0 ? genres.join('\n') : 'N/A',
                        inline: true
                    },
                    {
                        name: '**Stream**',
                        value: providers.flatrate.length > 0 ? providers.flatrate.join('\n') : 'N/A'
                    }
                ],
                thumbnail: {
                    url: image ? image : ''
                },
                footer: {
                    text: 'Powered by The Movie DB and JustWatch.'
                }
            }});
        } catch (error) {
            console.log(error);
        }
    },
    async searchTVShow(show) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/search/tv?query=${show}&api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();
    
            if(data.results.length === 0) return null;
  
            return data.results[0].id;   
        } catch (error) {
            console.log(error);
        }
    },
    async getTVShowDetails(id) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();
    
            const providers = await this.getTVShowProviders(id);

            const genres = [];
            data.genres.forEach(item => genres.push(`> ${item.name}`));
    
            return {
                name: data.name,
                tagline: data.tagline,
                overview: data.overview,
                url: providers.url ? providers.url : data.homepage,
                status: data.status,
                firstEpisode: data.first_air_date,
                nextEpisode: data.next_episode_to_air instanceof Object ? data.next_episode_to_air.air_date : data.next_episode_to_air,
                seasons: data.seasons.length,
                image: `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`,
                score: `${data.vote_average}/10`,
                runtime: this.minutesToHours(data.episode_run_time),
                genres,
                providers
            }   
        } catch (error) {
            console.log(error);
        }
    },
    async getTVShowProviders(id) {
        try {
            const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${process.env.THEMOVIEDB_API_KEY}`);
            const data = await res.json();

            const flatrate = [];
            data.results.PT?.flatrate.forEach(item => flatrate.push(`> ${item.provider_name}`));

            return {
                url: data.results.PT?.link,
                flatrate
            }   
        } catch (error) {
            console.log(error);
        }
    }
};
