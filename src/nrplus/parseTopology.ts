import { Bytestream } from './Bytestream.js'

type NRPlusNode = {
	id: number
	title: string
}
type NRPlusConnection = {
	from: number
	to: number
	distance: number
}
export type NRPlusNetworkTopology = {
	nodes: NRPlusNode[]
	connections: NRPlusConnection[]
}
const readNode = (stream: Bytestream): null | NRPlusNode => {
	const c = stream.current()
	const line = stream.readLine()
	if (/[0-9]+:\S+/.test(line)) {
		const [id, title] = line.split(':', 2) as [string, string]
		return {
			id: parseInt(id, 10),
			title,
		}
	}
	stream.seek(c)
	return null
}
const connectRx = /(?<from>[0-9]+)(?<distance>-{1,})>(?<to>[0-9]+)$/
const readConnection = (stream: Bytestream): null | NRPlusConnection => {
	const c = stream.current()
	const line = stream.readLine()
	if (connectRx.test(line)) {
		const { from, distance, to } = connectRx.exec(line)?.groups as any
		return {
			from: parseInt(from, 10),
			to: parseInt(to, 10),
			distance: distance.length,
		}
	}
	stream.seek(c)
	return null
}
export const parseTopology = (topology: string): NRPlusNetworkTopology => {
	const topo: NRPlusNetworkTopology = {
		nodes: [],
		connections: [],
	}

	const s = new Bytestream(topology)

	let node: null | NRPlusNode = null
	while ((node = readNode(s))) {
		topo.nodes.push(node)
	}

	let connection: NRPlusConnection | null = null
	while ((connection = readConnection(s))) {
		topo.connections.push(connection)
	}

	return topo
}
