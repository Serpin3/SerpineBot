import { WebhookCategory } from '@luferro/database';
import { MangadexApi } from '@luferro/mangadex-api';
import { StringUtil } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { Bot } from '../../structures/bot';
import type { JobData } from '../../types/bot';
import { JobName } from '../../types/enums';

export const data: JobData = {
	name: JobName.Manga,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	const chapters = await MangadexApi.getLastestChapters();

	const chaptersByManga = new Map(
		chapters
			.reverse()
			.map((manga) => [manga.mangaId, chapters.filter((chapter) => chapter.mangaId === manga.mangaId)]),
	);

	for (const [mangaId, mangaChapters] of chaptersByManga) {
		for (const { chapterId, url } of mangaChapters) {
			const { isDuplicated } = await client.manageState(data.name, null, `${mangaId}:${chapterId}`, url);
			if (!isDuplicated) continue;

			const chapterIndex = mangaChapters.findIndex((currentChapter) => currentChapter.chapterId === chapterId);
			mangaChapters.splice(chapterIndex);
			break;
		}
		if (mangaChapters.length === 0) continue;

		const { title, url, image } = await MangadexApi.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = mangaChapters
			.slice(0, 10)
			.reverse()
			.map(({ title, url }) => `**[${title}](${url})**`);
		const hiddenChaptersCount = mangaChapters.length - formattedChapters.length;
		if (hiddenChaptersCount > 0) formattedChapters.push(`And ${hiddenChaptersCount} more!`);

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setDescription(formattedChapters.join('\n'))
			.setColor('Random');

		await client.sendWebhookMessageToGuilds(WebhookCategory.Manga, embed);
	}
};
