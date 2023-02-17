import type { Point } from './layoutMesh'

export const boundingBox = <Element extends Point>(
	points: Element[],
): { top: number; left: number; width: number; height: number } => {
	const minX = points.reduce(
		(min, { x }) => (x < min ? x : min),
		Number.MAX_SAFE_INTEGER,
	)
	const maxX = points.reduce(
		(max, { x }) => (x > max ? x : max),
		Number.MIN_SAFE_INTEGER,
	)
	const minY = points.reduce(
		(min, { y }) => (y < min ? y : min),
		Number.MAX_SAFE_INTEGER,
	)
	const maxY = points.reduce(
		(max, { y }) => (y > max ? y : max),
		Number.MIN_SAFE_INTEGER,
	)

	return {
		left: minX,
		top: minY,
		width: maxX - minX,
		height: maxY - minY,
	}
}
