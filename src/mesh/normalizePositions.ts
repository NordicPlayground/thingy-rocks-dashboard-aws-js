import { boundingBox } from './boundingBox'
import type { Point } from './layoutMesh'

export const normalizePositions = <Element extends Point>(
	positions: Element[],
	padding = 0,
): {
	elements: Element[]
	center: Point
	box: ReturnType<typeof boundingBox>
} => {
	const { left: minX, top: minY, width, height } = boundingBox(positions)

	return {
		elements: positions.map(
			({ x, y, ...rest }) =>
				<Element>{
					x: x - minX + padding,
					y: y - minY + padding,
					...rest,
				},
		),
		center: {
			x: -minX + padding,
			y: -minY + padding,
		},
		box: {
			left: 0,
			top: 0,
			width: width + 2 * padding,
			height: height + 2 * padding,
		},
	}
}
