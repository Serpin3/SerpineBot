import { SearchEngine } from '@luferro/scraper';
import { StringUtil } from '@luferro/shared-utils';

import { Endpoint, getPlaytimesData } from './playtimes.scraper';

export const search = async (query: string) => {
	const results = await SearchEngine.search({ query: `${query} site:https://howlongtobeat.com` });
	if (results.length === 0) throw new Error(`No results were found for ${query}`);

	const { url } = results[0];
	const { searchParams } = new URL(url);
	const id = searchParams.get('id') ?? url.split('/').at(-1);
	return { id };
};

export const getPlaytimesById = async (id: string) => {
	const url = StringUtil.format<Endpoint>(Endpoint.GAME, id);
	return await getPlaytimesData(url);
};
