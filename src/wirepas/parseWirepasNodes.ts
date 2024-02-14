import { type WirepasGatewayNode } from '../context/Devices.js'

export type Connection = {
	from: string
	to: string
	// Latency
	lat: number
}
export const parseWirepasNodes = (
	nodes: Record<string /* node id */, WirepasGatewayNode>,
): Connection[] => {
	const nodesConnectedToSink = Object.entries(nodes).filter(
		([, { hops }]) => hops === 1,
	)
	const sinkId = 'GW'

	const connections = [
		...nodesConnectedToSink.map<Connection>(([id, node]) => ({
			from: id,
			to: sinkId,
			lat: node.lat,
		})),
	]

	// Add nodes with multiple hops
	const hopsAsc = new Set(
		Object.values(nodes)
			.map(({ hops }) => hops)
			.filter((hop) => hop > 1)
			.sort((h1, h2) => h1 - h2),
	)
	for (const hop of hopsAsc.values()) {
		const nodesAtHop = Object.entries(nodes).filter(
			([, { hops }]) => hops === hop,
		)
		// We do not know the real hop, so select a target node on a previous level by comparing the last numbers
		const potentialTargets = Object.entries(nodes).filter(
			([, { hops }]) => hops === hop - 1,
		)
		for (const [nodeId, node] of nodesAtHop) {
			const targetIds = potentialTargets.map(([id]) => id)
			const target = findTarget(nodeId, targetIds) ?? pickRandom(targetIds)
			connections.push({
				from: nodeId,
				to: target,
				lat: node.lat,
			})
		}
	}

	return connections
}

const findTarget = (
	nodeId: string,
	targetIds: string[],
	matchLen?: number,
): string | null => {
	if (matchLen === 0) return null
	const l = matchLen ?? nodeId.length
	const target = targetIds
		.sort((a, b) => a.localeCompare(b))
		.find((id) => reverse(id).slice(0, l) === reverse(nodeId).slice(0, l))
	if (target !== undefined) return target
	return findTarget(nodeId, targetIds, l - 1)
}

const pickRandom = (targetIds: string[]): string =>
	targetIds[Math.floor(Math.random() * targetIds.length)] as string

const reverse = (s: string): string => s.split('').reverse().join('')
