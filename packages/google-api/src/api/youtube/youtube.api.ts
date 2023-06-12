import { ConverterUtil } from '@luferro/shared-utils';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr, { type Video } from 'ytsr';

export const isVideo = (url: string) => Boolean(getVideoId(url));

export const isPlaylist = async (url: string) => Boolean(await getPlaylistId(url));

export const getVideoId = (url: string) => {
	try {
		return ytdl.getVideoID(url);
	} catch (error) {
		return null;
	}
};

export const getPlaylistId = async (url: string) => {
	try {
		return await ytpl.getPlaylistID(url);
	} catch (error) {
		return null;
	}
};

export const search = async (query: string) => {
	const { items } = await ytsr(query, { limit: 10 });
	const videos = items.filter(({ type }) => type === 'video') as Video[];

	return videos.map(({ url, title, author, thumbnails, duration, isLive }) => ({
		url,
		title: title ?? null,
		channel: author?.name ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: duration ?? 'N/A',
		isLivestream: isLive,
	}));
};

export const getVideoDetails = async (url: string) => {
	const { videoDetails } = await ytdl.getBasicInfo(url);
	const { title, author, thumbnails, lengthSeconds, isLiveContent } = videoDetails;

	return {
		url,
		title: title ?? null,
		thumbnail: thumbnails[0]?.url ?? null,
		duration: isLiveContent ? ConverterUtil.formatTime(Number(lengthSeconds) * 1000) : null,
		isLivestream: isLiveContent,
		channel: {
			id: author.id,
			name: author?.name ?? null,
			subscribers: author.subscriber_count ?? 0,
		},
	};
};

export const getPlaylist = async (url: string) => {
	const { title, author, estimatedItemCount, items } = await ytpl(url);

	return {
		url,
		title: title ?? null,
		channel: author?.name ?? null,
		count: estimatedItemCount ?? null,
		videos: items.map(({ url, title, author, thumbnails, duration, isLive }) => ({
			url,
			title: title ?? null,
			channel: author?.name ?? null,
			thumbnail: thumbnails[0]?.url ?? null,
			duration: duration ?? 'N/A',
			isLivestream: isLive,
		})),
	};
};
