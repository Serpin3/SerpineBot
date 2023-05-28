import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	StringSelectMenuInteraction,
} from 'discord.js';

type GenericInteraction<T> = { guild: Guild; member: GuildMember } & T;

export type ExtendedChatInputCommandInteraction = GenericInteraction<ChatInputCommandInteraction>;
export type ExtendedStringSelectMenuInteraction = GenericInteraction<StringSelectMenuInteraction>;
export type ExtendedButtonInteraction = GenericInteraction<ButtonInteraction>;

export type Interaction =
	| ExtendedChatInputCommandInteraction
	| ExtendedStringSelectMenuInteraction
	| ExtendedButtonInteraction;
