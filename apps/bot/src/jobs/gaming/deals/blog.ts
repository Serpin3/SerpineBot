import { RssModel } from '@luferro/database';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */20 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const feeds = await RssModel.getFeeds({ key: 'gaming.deals' });
	const data = await client.api.gaming.deals.getBlog({ feeds });

	const embeds = [];
	for (const { title, description, image, url } of data.reverse()) {
		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setImage(image)
			.setURL(url)
			.setDescription(description)
			.setColor('Random');

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Game Deals', embeds });
};
