import { Bot } from '../bot';
import * as CommandsHandler from '../handlers/commands';
import { settingsModel } from '../database/models/settings';
import { logger } from '../utils/logger';

export const data = {
	name: 'ready',
	once: true,
};

export const execute = async (client: Bot) => {
	await CommandsHandler.deploy(client);

	for (const [guildId, guild] of client.guilds.cache) {
		const settings = await settingsModel.findOne({ guildId });
		if (!settings) client.emit('guildCreate', guild);
	}

	logger.info(`SerpineBot is ready to process interactions.`);
};
