import { logger } from '@luferro/shared-utils';

import type { VoiceCommandExecute } from '../../../../types/bot';

export const execute: VoiceCommandExecute = async ({ client, guildId, slots }) => {
	const queue = client.player.nodes.get(guildId);
	if (!queue || !queue.currentTrack) throw new Error('Cannot remove track.');

	const position = Number(slots['position']);
	queue.node.remove(position - 1);

	logger.debug(`Voice command: remove track.`);
};
