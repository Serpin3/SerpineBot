import { RemindersModel } from '@luferro/database';
import { DateUtil, logger } from '@luferro/shared-utils';
import { EmbedBuilder } from 'discord.js';

import type { JobData, JobExecute } from '../types/bot';

export const data: JobData = { schedule: '*/30 * * * * *' };

export const execute: JobExecute = async ({ client }) => {
	const reminders = await RemindersModel.getReminders();
	const filteredReminders = reminders.filter(({ timeEnd }) => Date.now() >= timeEnd);
	for (const { reminderId, userId, timeStart, message } of filteredReminders) {
		try {
			const target = await client.users.fetch(userId);
			if (!target) throw new Error(`Cannot find a target with userId ${userId}.`);

			const embed = new EmbedBuilder()
				.setTitle(`Reminder set on ${DateUtil.formatDate(timeStart)}`)
				.addFields([
					{
						name: '**Message**',
						value: message.trim(),
					},
				])
				.setColor('Random');

			await target.send({ embeds: [embed] });
			await RemindersModel.deleteOne({ reminderId });

			logger.info(`Notified **${target.username}** about reminderId **${reminderId}**.`);
		} catch (error) {
			logger.warn(`Failed to notify **${userId}** about reminderId **${reminderId}**. Reason: **${error}**`);
		}
	}
};
