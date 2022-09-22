import type { SubscriptionsAggregate } from '../types/schemas';
import type { TheMovieDbCategory } from '@luferro/the-movie-db-api';
import { TheMovieDbApi } from '@luferro/the-movie-db-api';
import { StringUtil } from '@luferro/shared-utils';
import { subscriptionsModel } from '../database/models/subscriptions';

export const getGamingSubscriptions = async (title: string) => {
	const regex = new RegExp(`${StringUtil.slug(title).replace(/-/g, '(.*?)')}`);

	const results = (await subscriptionsModel.aggregate([
		{ $unwind: { path: '$catalog' } },
		{ $match: { 'catalog.slug': { $regex: regex } } },
		{ $group: { _id: '$name', entry: { $last: '$catalog' } } },
	])) as unknown as SubscriptionsAggregate[];

	return results.map(({ name, entry }) => ({
		name,
		entry: {
			name: entry.name,
			url: entry.url,
		},
	}));
};

export const getStreamingSubscriptions = async (title: string, category: TheMovieDbCategory) => {
	const { id } = await TheMovieDbApi.search(title, category);
	if (!id) return [];

	const { stream } = await TheMovieDbApi.getProviders(id, category);
	return stream.map(({ name, entry }) => ({ name, entry }));
};
