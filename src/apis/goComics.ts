import { load } from 'cheerio';
import { fetch } from '../utils/fetch';
import { ComicCategories } from '../types/categories';

export const getComics = async (category: ComicCategories) => {
	const options: Record<string, string> = {
		'garfield': 'https://www.gocomics.com/random/garfield',
		'peanuts': 'https://www.gocomics.com/random/peanuts',
		'get fuzzy': 'https://www.gocomics.com/random/getfuzzy',
		'fowl language': 'https://www.gocomics.com/random/fowl-language',
		'calvin and hobbes': 'https://www.gocomics.com/random/calvinandhobbes',
		'jake likes onions': 'https://www.gocomics.com/random/jake-likes-onions',
		'sarahs scribbles': 'https://www.gocomics.com/random/sarahs-scribbles',
		'worry lines': 'https://www.gocomics.com/random/worry-lines',
	};

	const data = await fetch<string>({ url: options[category] });
	let $ = load(data);

	const isRedirect = $('body').text().includes('redirected');
	if (isRedirect) {
		const randomUrl = $('a').attr('href')!;
		const randomData = await fetch<string>({ url: randomUrl });
		$ = load(randomData);
	}

	const title = $('.comic').attr('data-feature-name');
	const author = $('.comic').attr('creator');
	const url = $('.comic').attr('data-url');
	const image = $('.comic').attr('data-image');

	return {
		image,
		url,
		title: title === author ? title : `${title} by ${author}`,
	};
};
