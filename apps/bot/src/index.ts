import 'dotenv/config';

import { logger } from '@luferro/shared-utils';
import { GatewayIntentBits } from 'discord.js';

import { Bot } from './Bot';

(async () => {
	const client = new Bot({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildScheduledEvents,
		],
	});
	await client.start();

	process.on('uncaughtException', logger.error);
	process.on('SIGINT', client.stop);
	process.on('SIGTERM', client.stop);
})();
