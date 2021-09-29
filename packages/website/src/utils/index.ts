export function toType(
	value: unknown,
	type: 'object'
): Record<string, unknown>;
export function toType(
	value: unknown,
	type: 'strobj'
): Record<string, string>;
export function toType(value: unknown, type: 'string'): string | undefined;
export function toType(value: unknown, type: 'number'): number | undefined;
export function toType(
	value: unknown,
	type: 'object' | 'string' | 'number' | 'strobj'
): unknown {
	switch (type) {
	case 'object':
	case 'strobj':
		return value && typeof value === 'object' ? value : {};
	case 'string':
		if (typeof value === 'string') return value as string;
		break;
	case 'number':
		if (typeof value === 'number') return value as number;
		break;
	}
}

export function mapToList(obj: Record<string, unknown>) {
	const ret = []
	for (const [k, v] of Object.entries(obj)) ret.push(k, `${v}`)
	return ret
}

export function listToMap(arr: unknown[]) {
	if (Array.isArray(arr)) {
		const obj = {} as Record<string, unknown>
		for (let i = 0; i < arr.length; i += 2) {
			obj[arr[i]] = arr[i + 1]
		}
		return obj
	}
	return arr
}


export function klass(...args: string[]) {
	return args.join(' ')
}
