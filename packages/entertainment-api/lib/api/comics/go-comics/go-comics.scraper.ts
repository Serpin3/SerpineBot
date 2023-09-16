import { StaticScraper } from '@luferro/scraper';

export enum Endpoint {
	GARFIELD_COMIC = 'https://www.gocomics.com/random/garfield',
	PEANUTS_COMIC = 'https://www.gocomics.com/random/peanuts',
	GET_FUZZY_COMIC = 'https://www.gocomics.com/random/getfuzzy',
	FOWL_LANGUAGE_COMIC = 'https://www.gocomics.com/random/fowl-language',
	CALVIN_AND_HOBBES = 'https://www.gocomics.com/random/calvinandhobbes',
	JAKE_LIKES_ONIONS = 'https://www.gocomics.com/random/jake-likes-onions',
	SARAHS_SCRIBBLES = 'https://www.gocomics.com/random/sarahs-scribbles',
	WORRY_LINES = 'https://www.gocomics.com/random/worry-lines',
}

export const getComic = async (url: Endpoint) => {
	let $ = await StaticScraper.loadUrl({ url });

	const isRedirect = $('body').text().includes('redirected');
	if (isRedirect) {
		const redirectUrl = $('a').attr('href');
		if (redirectUrl) $ = await StaticScraper.loadUrl({ url: redirectUrl });
	}

	const title = $('.comic').attr('data-feature-name') ?? null;
	const author = $('.comic').attr('creator') ?? null;
	const dataUrl = $('.comic').attr('data-url') ?? null;
	const image = $('.comic').attr('data-image') ?? null;

	return {
		image,
		url: dataUrl,
		title: title === author ? title : `${title} by ${author}`,
	};
};
