import { capitalize } from "@luferro/helpers/transform";
import type { JobData, JobExecute } from "~/types/bot.js";

export const data: JobData = { schedule: "0 0 2 * * *" };

export const execute: JobExecute = async ({ client }) => {
	const catalogs = await client.api.gaming.games.subscriptions.getCatalogs();
	for (const { type, catalog } of catalogs) {
		const name = type.toLowerCase().split("_").map(capitalize).join(" ");
		client.logger.debug(`Subscriptions | Found ${catalog.length} entries in ${name} catalog`);

		const storedSubscription = await client.db.subscription.findUnique({ where: { type } });
		if (catalog.length < Math.round((storedSubscription?.count ?? 0) * 0.6)) {
			client.logger.warn(`Subscriptions | ${name} catalog update ignored`);
			continue;
		}

		await client.db.subscription.upsert({
			where: { type },
			create: { type, name, catalog, count: catalog.length },
			update: { catalog, count: catalog.length },
		});
		client.logger.info(`Subscriptions | ${name} catalog updated`);
	}
};
