import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { NintendoApi } from '@luferro/games-api';
import { StringUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.Nintendo,
	schedule: '0 */10 * * * *',
};

export const execute = async (client: Bot) => {
	const articles = await NintendoApi.getLatestNintendoNews();

	for (const { title, url, image } of articles.reverse()) {
		const { isDuplicated } = await client.manageState('Nintendo', 'News', title, url);
		if (isDuplicated) continue;

		const embed = new EmbedBuilder()
			.setTitle(StringUtil.truncate(title))
			.setURL(url)
			.setThumbnail(image)
			.setColor('Random');

		await client.sendWebhookMessageToGuilds('Nintendo', embed);
	}
};
