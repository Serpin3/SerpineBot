import { createLogger, format, transports } from 'winston';

const { colorize, combine, errors, timestamp, printf } = format;

export const logger = createLogger({
	format: combine(
		errors({ stack: true }),
		timestamp(),
		printf(({ timestamp, level, message, stack }) => {
			const colorizedMessage =
				level === 'debug' && typeof message !== 'string'
					? JSON.stringify(message)
					: message.replace(/\*\*(.*?)\*\*/g, '\x1b[36m$1\x1b[0m');
			const log = `${colorize().colorize(level, `[${timestamp}] ${level.toUpperCase()}:`)} ${colorizedMessage}`;
			return stack && level === 'error' ? `${log}\n${stack}` : log;
		}),
	),
	transports: [new transports.Console({ level: 'debug' })],
});
