/**
 * Helper function to create outer glow for texts
 */
export const outerGlow = (
	color: string,
	distance = 1,
	blur = 0,
	wrap = (s: string): string => s,
	join = ', ',
): string => {
	const glows = []
	for (const [x, y] of [
		[1, 0],
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1],
		[0, -1],
		[-1, -1],
	] as [number, number][]) {
		glows.push(wrap(`${x * distance}px ${y * distance}px ${blur}px ${color}`))
	}
	return `${glows.join(join)}`
}
