import { WebhookType } from "@luferro/database";
import { StringUtil } from "@luferro/shared-utils";
import { EmbedBuilder } from "discord.js";

import type { JobData, JobExecute } from "../types/bot";

export const data: JobData = { schedule: "0 */45 * * * *" };

export const execute: JobExecute = async ({ client }) => {
	for (const subreddit of client.config.get<string[]>("services.reddit.subreddits.memes")) {
		const posts = await client.api.reddit.getPosts({ subreddit, limit: 25 });

		const messages = [];
		for (const { title, url, selfurl, hasEmbeddedMedia, isSelf } of posts.reverse()) {
			if (isSelf) continue;

			if (hasEmbeddedMedia) {
				messages.push(`**[${StringUtil.truncate(title)}](<${selfurl}>)**\n${url}`);
				continue;
			}

			const embed = new EmbedBuilder()
				.setTitle(StringUtil.truncate(title))
				.setURL(selfurl)
				.setImage(url)
				.setColor("Random");

			messages.push(embed);
		}

		await client.propagate({ type: WebhookType.MEMES, messages });
	}
};
