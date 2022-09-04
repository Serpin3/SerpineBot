import fs from 'fs';
import { fetch } from './fetch';

export const isReachable = async (file: string) => {
	try {
		await fetch({ url: file });
		const isRemoved = file.includes('removed');

		return !isRemoved;
	} catch (error) {
		return false;
	}
};

export const getFiles = (path: string, subdirectory?: string, files: string[] = []) => {
	const data = fs.readdirSync(path, { withFileTypes: true });
	for (const item of data) {
		if (item.isDirectory()) {
			files = getFiles(`${path}/${item.name}`, item.name, files);
			continue;
		}

		files.push(`${subdirectory ? `${subdirectory}/${item.name}` : item.name}`);
	}

	return files;
};
