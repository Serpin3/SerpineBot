import { StaticScraper } from '@luferro/scraper';
import { ConverterUtil } from '@luferro/shared-utils';

type Payload<T> = { props: { pageProps: { game: { data: { game: T } } } } };

type Entry = {
	game_id: number;
	game_name: string;
	game_image: string;
	comp_main: number;
	comp_plus: number;
	comp_100: number;
};

export enum Endpoint {
	GAME = 'https://howlongtobeat.com/game/:id',
}

export const getPlaytimesData = async (url: Endpoint) => {
	const $ = await StaticScraper.loadUrl({ url });

	const script = $('script[type="application/json"]').text();
	const {
		props: {
			pageProps: {
				game: {
					data: {
						game: {
							0: { game_name, game_image, comp_main, comp_plus, comp_100 },
						},
					},
				},
			},
		},
	} = JSON.parse(script) as Payload<Entry[]>;

	return {
		name: game_name,
		image: game_image ? `https://howlongtobeat.com/games/${game_image}` : null,
		playtimes: {
			main: comp_main != 0 ? `${ConverterUtil.toHours(comp_main * 1000)}h` : null,
			mainExtra: comp_plus != 0 ? `${ConverterUtil.toHours(comp_plus * 1000)}h` : null,
			completionist: comp_100 != 0 ? `${ConverterUtil.toHours(comp_100 * 1000)}h` : null,
		},
	};
};
