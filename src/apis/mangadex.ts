import { fetch } from '../utils/fetch';
import { Chapter, Manga, Result, Results } from '../types/responses';

export const search = async (title: string) => {
	const data = await fetch<Results<Result>>({ url: `https://api.mangadex.org/manga?title=${title}` });
	return data.data[0].id.toString();
};

export const getMangaById = async (id: string) => {
	const {
		data: {
			attributes: {
				title: { en, ja, jp, 'ja-ro': romaji },
			},
			relationships,
		},
	} = await fetch<Manga>({ url: `https://api.mangadex.org/manga/${id}?includes[]=cover_art` });

	const coverArt = relationships.find(({ type }) => type === 'cover_art')!;
	const image = coverArt ? `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes!.fileName}` : null;

	return {
		id,
		title: en ?? ja ?? jp ?? romaji,
		url: `https://mangadex.org/title/${id}`,
		image,
	};
};

export const getLastestChapters = async (limit = 20) => {
	const { data } = await fetch<Results<Chapter>>({
		url: `https://api.mangadex.org/chapter?originalLanguage[]=ja&translatedLanguage[]=en&order[readableAt]=desc&limit=${limit}`,
	});

	return data.map(({ id, attributes: { title, chapter, externalUrl }, relationships }) => {
		const manga = relationships.find(({ type }) => type === 'manga')!;

		const chapterNumber = chapter ? `Ch. ${chapter}` : '';
		const chapterTitle = title ?? '';

		return {
			chapterId: id,
			mangaId: manga.id,
			title: !chapter && !title ? 'Oneshot' : `${chapterNumber} ${chapterTitle}`,
			url: externalUrl ?? `https://mangadex.org/chapter/${id}`,
		};
	});
};
