import { logger } from '@luferro/shared-utils';
import type { Guild } from 'discord.js';

import type { EventData, EventExecute } from '../../types/bot';

type Args = [guild: Guild];

export const data: EventData = { type: 'on' };

export const execute: EventExecute<Args> = async ({ client, rest: [guild] }) => {
	await client.prisma.guild.create({ data: { id: guild.id, roles: { channelId: null, options: [] }, webhooks: [] } });
	logger.info(`Settings for **${guild.name}** have been created.`);
};
