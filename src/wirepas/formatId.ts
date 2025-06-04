export const nbsp = String.fromCharCode(8239)
export const formatId = (id: string): string =>
	id.length > 4 ? `…${id.slice(-4)}` : id
