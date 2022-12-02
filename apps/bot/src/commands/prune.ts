import type { CommandData } from '../types/bot';
import type { ExtendedChatInputCommandInteraction } from '../types/interaction';
import { ChannelType } from 'discord.js';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { CommandName } from '../types/enums';

export const data: CommandData = {
	name: CommandName.Prune,
	slashCommand: new SlashCommandBuilder()
		.setName(CommandName.Prune)
		.setDescription("Deletes the last N messages. Maximum of 100 messages and these can't be older than 2 weeks.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option.setName('quantity').setDescription('Quantity of messages to delete.').setRequired(true),
		),
};

export const execute = async (interaction: ExtendedChatInputCommandInteraction) => {
	const quantity = interaction.options.getInteger('quantity', true);
	if (quantity < 2 || quantity > 100) throw new Error('Cannot prune. Quantity must be between 2 and 100 messages.');

	const channel = interaction.channel;
	if (channel?.type !== ChannelType.GuildText) throw new Error('Channel must be a text channel.');

	const messages = await channel.bulkDelete(quantity, true);
	const ignoredMessages = quantity - messages.size;

	await interaction.reply({
		content: `${messages.size} messages have been deleted. ${ignoredMessages} messages were ignored.`,
		ephemeral: true,
	});
};
