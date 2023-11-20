import { DateUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';
import { t } from 'i18next';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '*/30 * * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const reminders = await client.prisma.reminder.findMany({ where: { timeEnd: { lt: new Date() } } });
	for (const { id, userId, timeStart, message } of reminders) {
		const embed = new EmbedBuilder()
			.setTitle(t('jobs.reminders.embed.title', { date: DateUtil.format(timeStart) }))
			.addFields([
				{
					name: t('jobs.reminders.embed.fields.0.name'),
					value: message.trim(),
				},
			])
			.setColor('Random');

		const target = await client.users.fetch(userId);
		await target.send({ embeds: [embed] });
		await client.prisma.reminder.delete({ where: { id } });

		logger.info(`Notified **${target.username}** about reminderId **${id}**.`);
	}
};
