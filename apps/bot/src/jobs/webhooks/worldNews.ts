import type { JobData } from '../../types/bot';
import type { Bot } from '../../structures/bot';
import { EmbedBuilder } from 'discord.js';
import { GNewsApi } from '@luferro/gnews-api';
import { SleepUtil } from '@luferro/shared-utils';
import { WebhookName } from '../../types/enums';

export const data: JobData = {
	name: WebhookName.WorldNews,
	schedule: '0 */30 * * * *',
};

export const execute = async (client: Bot) => {
	const news = await GNewsApi.getBreakingNews();

	for (const { title, url, publisher, description, image, publishedAt } of news.slice(0, 20).reverse()) {
		await SleepUtil.sleep(1000);

		const { isDuplicated } = await client.manageState('Breaking News', 'World', title, url);
		if (isDuplicated) continue;

		const embed = new EmbedBuilder()
			.setAuthor({ name: publisher.name, url: publisher.url })
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setThumbnail(image)
			.setTimestamp(publishedAt)
			.setColor('Random');

		await client.sendWebhookMessageToGuilds('World News', embed);
	}
};
