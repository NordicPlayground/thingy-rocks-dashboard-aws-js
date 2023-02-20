import type { MeshNodeInfo } from '../context/Devices'

export type ConnectedMeshNode = {
	node: number
	travelTimeMs: number
	hops: number
	connections: ConnectedMeshNode[]
}

type MeshNetworkNode = Pick<MeshNodeInfo, 'node' | 'hops' | 'travelTimeMs'>
export type MeshNetwork = MeshNetworkNode[]

export const buildTree = (network: MeshNetwork): ConnectedMeshNode[] => {
	const connected: number[] = []
	// Start with nodes that have only 1 hop, they are connected directly to the Gateway
	const tree = network
		.filter(({ hops }) => hops === 1)
		.map(toConnectedNode(network, connected))
	// And attach them remaining nodes
	return attachRemaining(tree, network, connected)
}

const attachRemaining = (
	tree: ConnectedMeshNode[],
	network: MeshNetwork,
	connected: number[],
): ConnectedMeshNode[] =>
	tree.map((node) => attachRemainingToNode(node, network, connected))

const attachRemainingToNode = (
	node: ConnectedMeshNode,
	network: MeshNetwork,
	connected: number[],
): ConnectedMeshNode => {
	const connections = node.connections.map((child) =>
		attachRemainingToNode(child, network, connected),
	)

	if ((node.hops ?? 1) > 0) {
		// Find unconnected nodes on the next level
		for (const remaining of network
			.filter(({ hops }) => (hops ?? 1) === (node.hops ?? 1) + 1)
			.filter(({ node }) => !connected.includes(node))) {
			connected.push(remaining.node)
			connections.push(toConnectedNode(network, connected)(remaining))
		}
	}
	return {
		...node,
		connections,
	}
}

/**
 * We connect nodes if the last digits of their nodes are equal.
 */
const sameTailNumber =
	(parent: MeshNetworkNode) =>
	(node: MeshNetworkNode): boolean =>
		parent.node.toString().endsWith(node.node.toString().slice(-1))

/**
 * This builds (fake) connections between nodes, because right now we do not have access to the real mesh topology.
 */
const buildConnections = (
	parent: MeshNetworkNode,
	network: MeshNetwork,
	connected: number[],
): ConnectedMeshNode[] => {
	const connections = network
		.filter(({ node }) => !connected.includes(node))
		.filter(({ hops }) => hops === (parent.hops ?? 0) + 1)
		.filter(sameTailNumber(parent))
		.map(toConnectedNode(network, connected))
	connected.push(...connections.map(({ node }) => node))
	return connections
}

const toConnectedNode =
	(network: MeshNetwork, connected: number[]) =>
	(node: MeshNetworkNode): ConnectedMeshNode => ({
		node: node.node,
		travelTimeMs: node.travelTimeMs,
		hops: node.hops ?? 1,
		connections: buildConnections(node, network, connected),
	})
