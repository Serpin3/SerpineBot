import { FetchUtil } from '@luferro/shared-utils';
import { load } from 'cheerio';

type Url = { url: string };
type Html = { html: string };

export const loadHtml = ({ html }: Html) => load(html);

export const loadUrl = async ({ url }: Url) => {
	const { payload } = await FetchUtil.fetch<string>({
		url,
		customHeaders: new Map([['content-type', 'plain/text']]),
	});
	return loadHtml({ html: payload });
};
