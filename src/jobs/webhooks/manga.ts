import { EmbedBuilder } from 'discord.js';
import { Bot } from '../../bot';
import * as Mangadex from '../../apis/mangadex';
import * as Webhooks from '../../services/webhooks';
import * as StringUtil from '../../utils/string';
import * as SleepUtil from '../../utils/sleep';
import { WebhookCategory, WebhookJobName } from '../../types/enums';

export const data = {
	name: WebhookJobName.Manga,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	const chapters = await Mangadex.getLastestChapters();
	if (chapters.length === 0) return;

	const chaptersByManga = new Map(
		chapters
			.reverse()
			.map(({ mangaId }) => [
				mangaId,
				chapters.filter(({ mangaId: currentMangaId }) => currentMangaId === mangaId),
			]),
	);

	for (const [mangaId, mangaChapters] of chaptersByManga) {
		for (const { chapterId, url } of mangaChapters) {
			const hasEntry = await client.manageState('Manga', 'Chapters', `${mangaId} - ${chapterId}`, url);
			if (!hasEntry) continue;

			const chapterIndex = mangaChapters.findIndex(
				({ chapterId: currentChapterId }) => currentChapterId === chapterId,
			);
			mangaChapters.splice(chapterIndex);

			await SleepUtil.timeout(1000);
			break;
		}
		if (mangaChapters.length === 0) continue;

		const { title, url, image } = await Mangadex.getMangaById(mangaId);
		if (!title && !url) continue;

		const formattedChapters = mangaChapters
			.slice(0, 10)
			.reverse()
			.map(({ title, url }) => `**[${title}](${url})**`);
		const hasMoreItems = mangaChapters.length - formattedChapters.length > 0;
		if (hasMoreItems) formattedChapters.push(`And ${mangaChapters.length - formattedChapters.length} more!`);

		for (const { 0: guildId } of client.guilds.cache) {
			const webhook = await Webhooks.getWebhook(client, guildId, WebhookCategory.Manga);
			if (!webhook) continue;

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(url)
				.setThumbnail(image)
				.setDescription(formattedChapters.join('\n'))
				.setColor('Random');

			await webhook.send({ embeds: [embed] });
		}
	}
};
