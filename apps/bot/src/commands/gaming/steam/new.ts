import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('new')
	.setDescription("Steam's upcoming games.");

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const upcoming = await client.api.gaming.steam.getUpcoming();
	if (upcoming.length === 0) throw new Error("No games were found in Steam's upcoming list.");

	const embed = new EmbedBuilder()
		.setTitle("Steam's Upcoming Games")
		.setDescription(upcoming.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
