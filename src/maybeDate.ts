export const maybeDate = (date: string | number): Date | null => {
	const d = new Date(date)
	if (isNaN(d.getTime())) {
		console.warn(`Failed to parse as date: ${date}`)
		return null
	}
	return d
}
