import type { ConnectedMeshNode } from './buildTree'

export type PlacedMeshNode = ConnectedMeshNode & {
	heading: number
	parent?: ConnectedMeshNode['node'] | undefined
} & Point

export const isGateway = (node: PlacedMeshNode): boolean => node.node === 0
export const isNode = (node: PlacedMeshNode): boolean => !isGateway(node)

export const layoutMesh = (
	connectedNodes: ConnectedMeshNode[],
	distance = 75,
	startAngle = 0,
	placedNodes: PlacedMeshNode[] = [
		{
			connections: [],
			heading: 0,
			hops: 0,
			node: 0,
			travelTimeMs: 0,
			x: 0,
			y: 0,
		},
	],
	parent?: PlacedMeshNode,
	depth = 1,
): PlacedMeshNode[] => {
	const numNodes = connectedNodes.length
	const isRoot = placedNodes.length === 1
	const segment = (Math.PI * 2) / depth
	const rot = segment / numNodes
	for (let i = 0; i < connectedNodes.length; i++) {
		const node = <ConnectedMeshNode>connectedNodes[i]
		let heading = startAngle + rot * i
		if (!isRoot) heading -= rot / 2
		// No rotation if just one node
		if (numNodes === 1) heading = startAngle
		const placedNode: PlacedMeshNode = {
			...node,
			heading,
			...move({
				x: parent?.x ?? 0,
				y: parent?.y ?? 0,
				heading,
				distance,
			}),
			parent: parent?.node,
		}
		placedNodes.push(placedNode)
		if (node.connections.length > 0) {
			layoutMesh(
				node.connections,
				distance,
				heading,
				placedNodes,
				placedNode,
				++depth,
			)
		}
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
	x: Math.round(x + Math.sin(heading) * distance),
	y: Math.round(y - Math.cos(heading) * distance),
})
