import type { EventData } from '../types/bot';
import type { Bot } from '../structures/bot';
import type { VoiceState } from 'discord.js';
import { EventName } from '../types/enums';

export const data: EventData = {
	name: EventName.VoiceStateUpdate,
	type: 'on',
};

export const execute = async (client: Bot, oldState: VoiceState, newState: VoiceState) => {
	const isSelf = oldState.guild.members.me?.user.id === oldState.member?.user.id;
	const isStillInVoiceChannel = newState.channel?.isVoiceBased();
	if (isSelf && !isStillInVoiceChannel) client.player.deleteQueue(newState.guild.id);
};
