import { BirthdaysModel } from '@luferro/database';
import { DateUtil } from '@luferro/shared-utils';
import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { t } from 'i18next';

import { InteractionCommandData, InteractionCommandExecute } from '../../../types/bot';

export const data: InteractionCommandData = new SlashCommandSubcommandBuilder()
	.setName(t('interactions.birthdays.create.name'))
	.setDescription(t('interactions.birthdays.create.description'))
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.birthdays.create.options.0.name'))
			.setDescription(t('interactions.birthdays.create.options.0.description'))
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.birthdays.create.options.1.name'))
			.setDescription(t('interactions.birthdays.create.options.1.description'))
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName(t('interactions.birthdays.create.options.2.name'))
			.setDescription(t('interactions.birthdays.create.options.2.description'))
			.setRequired(true),
	);

export const execute: InteractionCommandExecute = async ({ interaction }) => {
	const day = interaction.options.getInteger(t('interactions.birthdays.create.options.0.name'), true);
	const month = interaction.options.getInteger(t('interactions.birthdays.create.options.1.name'), true);
	const year = interaction.options.getInteger(t('interactions.birthdays.create.options.2.name'), true);

	if (!DateUtil.isValidDate(year, month, day)) throw new Error(t('errors.date.invalid'));

	const isBirthdayRegistered = await BirthdaysModel.isBirthdayRegistered({ userId: interaction.user.id });
	if (isBirthdayRegistered) throw new Error(t('errors.unprocessable'));

	await BirthdaysModel.createBirthday({ userId: interaction.user.id, date: new Date(year, month - 1, day) });

	const embed = new EmbedBuilder().setTitle(t('interactions.birthdays.create.embed.title')).setColor('Random');
	await interaction.reply({ embeds: [embed], ephemeral: true });
};
