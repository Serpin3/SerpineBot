import { FetchUtil, StringUtil } from '@luferro/shared-utils';

import { Id, Limit, Query } from '../../types/args';

type Payload<T> = { data: T };

type Relationship<T = unknown> = {
	id: string;
	type: 'manga' | 'cover_art';
	attributes: T;
};

type Chapter = {
	id: string;
	attributes: { volume: string | null; chapter: string; title: string; externalUrl: string };
	relationships: Relationship[];
};

type Manga = {
	id: string;
	attributes: {
		title: { 'en': string; 'ja': string; 'jp': string; 'ja-ro': string };
		status: string;
		year: number;
		tags: { attributes: { name: { en: string } } }[];
	};
	relationships: Relationship<{ fileName: string }>[];
};

export const search = async ({ query }: Query) => {
	const { payload } = await FetchUtil.fetch<Payload<Manga[]>>({
		url: `https://api.mangadex.org/manga?title=${query}`,
	});

	return payload.data.map((result) => {
		const { title } = result.attributes;
		return { id: result.id, title: title.en ?? title['ja-ro'] ?? title.ja ?? title.jp };
	});
};

export const getMangaById = async ({ id }: Id) => {
	const { payload } = await FetchUtil.fetch<Payload<Manga>>({ url: `https://api.mangadex.org/manga/${id}` });
	const { attributes } = payload.data;

	const { title, status, year, tags } = attributes;
	const image = `https://og.mangadex.org/og-image/manga/${id}`;
	const release = year ? `${year}, ` : null;
	const publication = status ? StringUtil.capitalize(status) : null;

	return {
		id,
		image,
		title: title.en ?? title['ja-ro'] ?? title.ja ?? title.jp,
		url: `https://mangadex.org/title/${id}`,
		publication: release || publication ? `${release ?? ''} ${publication ?? ''}`.trim() : null,
		tags: tags.map((tag) => tag.attributes.name.en),
	};
};

export const getChapters = async ({ limit = 20 }: Partial<Limit>) => {
	const { payload } = await FetchUtil.fetch<Payload<Chapter[]>>({
		url: `https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&includes[]=manga&limit=${limit}`,
	});

	return payload.data.map(({ id, attributes: { title, chapter, externalUrl }, relationships }) => ({
		mangaId: relationships.find(({ type }) => type === 'manga')!.id,
		chapter: {
			id,
			title: chapter || title ? `${chapter ? `Ch. ${chapter}` : ''} ${title ?? ''}`.trim() : 'Oneshot',
			url: externalUrl ?? `https://mangadex.org/chapter/${id}`,
		},
	}));
};
