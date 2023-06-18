import { EmbedBuilder, Role, SlashCommandSubcommandBuilder } from 'discord.js';

import type { CommandData, CommandExecute } from '../../types/bot';

export const data: CommandData = new SlashCommandSubcommandBuilder()
	.setName('unassign')
	.setDescription('Unassign a role from a guild member.')
	.addUserOption((option) => option.setName('user').setDescription('Guild user.').setRequired(true))
	.addRoleOption((option) => option.setName('role').setDescription('Guild role.').setRequired(true));

export const execute: CommandExecute = async ({ interaction }) => {
	const user = interaction.options.getUser('user', true);
	const role = interaction.options.getRole('role', true) as Role;

	const member = interaction.guild.members.cache.find(({ id }) => id === user.id)!;
	if (!member.roles.cache.has(role.id)) throw new Error(`${member.user.username} doesn't have role ${role.name}.`);
	await member.roles.remove(role);

	const embed = new EmbedBuilder()
		.setTitle(`Role ${role.name} has been removed from ${user.username}.`)
		.setColor('Random');

	await interaction.reply({ embeds: [embed], ephemeral: true });
};
