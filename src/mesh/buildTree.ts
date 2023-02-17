import type { MeshNodeInfo } from '../context/Devices'

export type ConnectedMeshNode = {
	node: number
	travelTimeMs: number
	connections: ConnectedMeshNode[]
}

export type MeshNetwork = Pick<MeshNodeInfo, 'node' | 'hops' | 'travelTimeMs'>[]

export const buildTree = (network: MeshNetwork): ConnectedMeshNode[] =>
	// Start with nodes that have only 1 hop, they are connected directly to the Gateway
	network.filter(({ hops }) => hops === 1).map(toConnectedNode(network))

/**
 * This builds (fake) connections between nodes, because right now we do not have access to the real mesh topology.
 * We connect nodes if the last digits of their nodes are equal.
 */
const buildConnections = (
	parent: Pick<MeshNodeInfo, 'node' | 'hops' | 'travelTimeMs'>,
	network: MeshNetwork,
	connected: number[] = [],
): ConnectedMeshNode[] => {
	const connections = network
		.filter(({ node }) => !connected.includes(node))
		.filter(({ hops }) => hops === (parent.hops ?? 0) + 1)
		.filter(({ node }) =>
			parent.node.toString().endsWith(node.toString().slice(-1)),
		)
		.map(toConnectedNode(network))
	connected.push(...connections.map(({ node }) => node))
	return connections
}

const toConnectedNode =
	(network: MeshNetwork, connected: number[] = []) =>
	(
		node: Pick<MeshNodeInfo, 'node' | 'hops' | 'travelTimeMs'>,
	): ConnectedMeshNode => ({
		node: node.node,
		travelTimeMs: node.travelTimeMs,
		connections: buildConnections(node, network, connected),
	})
