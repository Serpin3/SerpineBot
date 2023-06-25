import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */15 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const deals = await client.api.gaming.deals.getLatestDeals();
	const freeDeals = deals.filter(({ isFree }) => isFree);

	const embeds = [];
	for (const { title, deals } of freeDeals.reverse()) {
		for (const { url, discount, regular, store, expiry } of deals) {
			const isSuccessful = await client.state({ title, url });
			if (!isSuccessful) continue;

			const embed = new EmbedBuilder()
				.setTitle(title)
				.setURL(url)
				.setDescription(`**-${discount}%** off! ~~${regular}~~ | **Free** @ **${store}**`)
				.setColor('Random');
			if (expiry) embed.setFooter({ text: `Expires on ${expiry}` });

			embeds.push(embed);
		}
	}

	await client.propageMessages({ category: 'Free Games', embeds });
};
