import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../../../types/bot';

export const data: JobData = { schedule: '0 */10 * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const deals = await client.api.gaming.itad.getLatestDeals();

	const embeds = [];
	for (const { title, url, isFree, discount, regular, current, store, expiry } of deals.reverse()) {
		if (!isFree) continue;

		const isSuccessful = await client.state({ title, url });
		if (!isSuccessful) continue;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setURL(url)
			.setDescription(`**${discount}%** off! ~~${regular}~~ | **${current}** @ **${store}**`)
			.setColor('Random');
		if (expiry) embed.setFooter({ text: `Expires on ${expiry}` });

		embeds.push(embed);
	}

	await client.propageMessages({ category: 'Free Games', embeds });
};
