import { Bytestream } from './Bytestream.js'

export type NRPlusNodeInfo = {
	id: number
	title: string
	sink?: boolean
}
export type NRPlusNodeConnection = {
	from: number
	to: number
	distance: number
}
export type NRPlusNetworkTopology = {
	nodes: NRPlusNodeInfo[]
	connections: NRPlusNodeConnection[]
}
const nodeRx = /(?<id>[0-9]+)(?<sink>\*)?:(?<title>.+)/
const readNode = (stream: Bytestream): null | NRPlusNodeInfo => {
	const c = stream.current()
	const line = stream.readLine()
	if (nodeRx.test(line)) {
		const { id, sink, title } = nodeRx.exec(line)?.groups as any
		return {
			id: parseInt(id, 10),
			title,
			sink: sink !== undefined,
		}
	}
	stream.seek(c)
	return null
}
const connectRx = /(?<from>[0-9]+)(?<distance>-{1,})>(?<to>[0-9]+)$/
const readConnection = (stream: Bytestream): null | NRPlusNodeConnection => {
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
	const nodes: Array<NRPlusNodeInfo> = []
	const connections: Array<NRPlusNodeConnection> = []

	const s = new Bytestream(topology)

	let node: null | NRPlusNodeInfo = null
	while ((node = readNode(s))) {
		nodes.push(node)
	}

	let connection: NRPlusNodeConnection | null = null
	while ((connection = readConnection(s))) {
		connections.push(connection)
	}

	return {
		nodes,
		connections,
	}
}
