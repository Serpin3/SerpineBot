import 'dotenv/config';
import { GatewayIntentBits } from 'discord.js';
import { Bot } from './structures/bot';
import { path } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

(async () => {
	const client = new Bot({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.GuildVoiceStates,
		],
	});
	client.start();

	['SIGINT', 'SIGTERM'].forEach((event) => process.on(event, client.stop));
})();
