import { JobData, JobExecute } from '../../types/bot';

export const data: JobData = { schedule: '0 0 0 * * 1' };

export const execute: JobExecute = async ({ client }) => {
	const schedule = await client.api.shows.animeschedule.getWeeklySchedule();
	for (const anime of schedule) {
		const weekDay = new Date(anime.episodes.current.date).getUTCDay();

		const cache = client.cache.anime.get(weekDay);
		if (!cache) {
			client.cache.anime.set(weekDay, [anime]);
			continue;
		}

		client.cache.anime.set(weekDay, cache.concat(anime));
	}
};
