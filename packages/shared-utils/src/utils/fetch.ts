import axios from 'axios';
import { HeaderGenerator, Headers } from 'header-generator';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { FetchError } from '../errors/FetchError';

type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
type Request = { url: string | URL; method?: HttpMethod; authorization?: string; body?: string };

axios.defaults.httpsAgent = new SocksProxyAgent('socks://127.0.0.1:9050');

export const getHeaders = ({ method, authorization }: Pick<Request, 'method' | 'authorization'>) => {
	const custom = new Map();
	if (method === 'POST' || method === 'PUT') custom.set('content-type', 'application/json');
	if (authorization) custom.set('Authorization', `Bearer ${authorization}`);

	return new HeaderGenerator().getHeaders({}, Object.fromEntries(custom));
};

export const fetch = async <T>({ method = 'GET', url, authorization, body }: Request) => {
	try {
		const res = await axios(url.toString(), {
			method,
			headers: getHeaders({ method, authorization }),
			data: body ? JSON.parse(body) : null,
		});
		if (res.status >= 400) throw new Error(`${res.status} ${res.statusText}`);

		const headers = res.headers as Headers;
		const payload = res.data as T;

		return { headers, payload };
	} catch (error) {
		throw new FetchError(`**${method}** request to **${url}** failed. Reason: ${(error as Error).message}`);
	}
};
