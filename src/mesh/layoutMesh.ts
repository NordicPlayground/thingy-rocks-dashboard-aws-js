import type { ConnectedMeshNode } from './buildTree'

export type PlacedMeshNode = ConnectedMeshNode & {
	heading: number
	parent?: ConnectedMeshNode['node'] | undefined
} & Point

export const isGateway = (node: PlacedMeshNode): boolean => node.node === 0
export const isNode = (node: PlacedMeshNode): boolean => !isGateway(node)

const Circle = Math.PI * 2

export const layoutMesh = (
	connectedNodes: ConnectedMeshNode[],
	distance = 75,
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
): PlacedMeshNode[] => {
	const rot = Circle / connectedNodes.length
	let currentHeading = 0
	for (const node of connectedNodes) {
		placeNode(node, placedNodes, distance, Circle / 6, currentHeading)
		currentHeading += rot
	}
	return placedNodes
}

const placeNode = (
	node: ConnectedMeshNode,
	placedNodes: PlacedMeshNode[],
	distance: number,
	segment: number,
	heading: number,
	parent?: PlacedMeshNode,
) => {
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
	const numNodes = node.connections.length
	// Place connections
	const rot = segment / (numNodes - 1)
	let currentHeading = heading - segment / 2
	// No rotation if just one node
	if (numNodes === 1) currentHeading = heading
	for (const child of node.connections) {
		placeNode(
			child,
			placedNodes,
			distance,
			(segment * 2) / 3,
			currentHeading,
			placedNode,
		)
		currentHeading += rot
	}
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
