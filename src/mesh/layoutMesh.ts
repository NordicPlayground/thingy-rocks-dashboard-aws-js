import type { ConnectedMeshNode } from './buildTree'

export type PlacedMeshNode = ConnectedMeshNode & {
	heading: number
	parent?: ConnectedMeshNode['node'] | undefined
} & Point

export const layoutMesh = (
	connectedNodes: ConnectedMeshNode[],
	startAngle = 0,
	segment = Math.PI * 2,
	placedNodes: PlacedMeshNode[] = [],
	parent?: PlacedMeshNode,
): PlacedMeshNode[] => {
	const rot = segment / connectedNodes.length
	for (let i = 0; i < connectedNodes.length; i++) {
		const node = <ConnectedMeshNode>connectedNodes[i]
		const heading = rot * i + startAngle
		const placedNode: PlacedMeshNode = {
			...node,
			heading,
			...move({
				x: parent?.x ?? 0,
				y: parent?.y ?? 0,
				heading,
				distance: node.travelTimeMs,
			}),
			parent: parent?.node,
		}
		placedNodes.push(placedNode)
		layoutMesh(
			node.connections,
			heading + rot * (Math.random() - 0.5),
			rot,
			placedNodes,
			placedNode,
		)
	}
	return placedNodes
}

export type Point = { x: number; y: number }
export const move = ({
	x,
	y,
	heading,
	distance,
}: Point & { heading: number; distance: number }): Point => ({
	x: x + Math.sin(heading) * distance,
	y: y - Math.cos(heading) * distance,
})
