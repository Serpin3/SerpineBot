export const splitIntoChunks = <T>(array: T[], size: number) => {
	const result: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}

	return result;
};

export const partition = <T, U>(array: T[], filter: (item: T) => boolean): [U[], Exclude<T, U>[]] => {
	return array.reduce(
		(acc, el) => {
			if (filter(el)) {
				acc[0].push(el as unknown as U);
			} else {
				acc[1].push(el as Exclude<T, U>);
			}
			return acc;
		},
		[[], []] as [U[], Exclude<T, U>[]],
	);
};

export const shuffle = <T>(array: T[]) => {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
};

export const enumToArray = <T extends { [name: string]: number | string }>(enumeration: T) => {
	return Object.keys(enumeration)
		.filter((value) => isNaN(Number(value)))
		.map((value) => value as keyof T);
};
