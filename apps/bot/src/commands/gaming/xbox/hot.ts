import { EmbedBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

import { CommandData, CommandExecute } from '../../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('hot')
	.setDescription("Xbox's top sellers.");

export const execute: CommandExecute = async ({ client, interaction }) => {
	await interaction.deferReply();

	const topSellers = await client.api.gaming.xbox.getTopSellers();
	if (topSellers.length === 0) throw new Error("No games were found in Xbox's top sellers list.");

	const embed = new EmbedBuilder()
		.setTitle("Xbox's Top Sellers")
		.setDescription(topSellers.join('\n'))
		.setColor('Random');

	await interaction.editReply({ embeds: [embed] });
};
