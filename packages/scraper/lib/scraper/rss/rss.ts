import { DateUtil } from '@luferro/shared-utils';
import Parser from 'rss-parser';

import { StaticScraper } from '../web-pages/static';

type Instance = { staticScraper: StaticScraper };
type Url = { url: string };
type Html = { html: string };
type Selector = { selector: string };
type Image = { isExternal?: boolean } & Selector;
export type Feeds = { feeds: { feed: string; options?: { image: Image } }[] };

export class RSS extends Parser {
	private staticScraper: StaticScraper;

	constructor({ staticScraper }: Instance) {
		super();
		this.staticScraper = staticScraper;
	}

	private async retrieveExternalImage({ url, selector }: Url & Selector) {
		const $ = await this.staticScraper.loadUrl({ url });
		return $(selector).first().attr('src') ?? null;
	}

	private async retrieveInternalImage({ html, selector, url }: Html & Selector & Partial<Url>) {
		const $ = this.staticScraper.loadHtml({ html });
		const image = $(selector).first().attr('src');
		if (!image && url) return await this.retrieveExternalImage({ url, selector });
		return image ?? null;
	}

	async consume({ feeds }: Feeds) {
		const data = [];
		for (const { feed, options } of feeds) {
			const output = await this.parseURL(feed);
			const items = await Promise.all(
				output.items
					.filter(({ isoDate }) => isoDate && DateUtil.isToday({ date: new Date(isoDate) }))
					.map(
						async ({
							creator,
							categories,
							title,
							link,
							content,
							'content:encoded': encodedContent,
							contentSnippet,
							isoDate,
						}) => {
							let image: string | null = null;
							if (options?.image) {
								const { isExternal, selector } = options.image;
								const html = encodedContent ?? content;
								image =
									isExternal && link
										? await this.retrieveExternalImage({ url: link, selector })
										: await this.retrieveInternalImage({ html, selector, url: link });
							}

							return {
								image,
								creator: creator ?? null,
								categories: categories ?? [],
								title: title!,
								url: link!,
								description: contentSnippet!,
								publishedAt: isoDate ? new Date(isoDate) : new Date(),
							};
						},
					),
			);
			data.push(...items);
		}
		return data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
	}
}
