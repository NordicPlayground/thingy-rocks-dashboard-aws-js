import {
	type NRPlusNetworkTopology,
	type NRPlusNodeInfo,
} from './parseTopology.js'

enum Colors {
	connection = '#d1203a',
	helpers = '#ff61dd88',
	forces = '#5f9efb',
	cellular = '#f48120',
	text = '#333333',
}

export const NRPlusTopology = ({
	topology,
	size: { width, height },
	nodeSize,
	showHelpers,
}: {
	topology: NRPlusNetworkTopology
	size: { width: number; height: number }
	nodeSize?: number
	showHelpers?: boolean
}) => {
	// Start with the sink nodes, for now we assume only one sink
	const sinkNodes = topology.nodes.filter(({ sink }) => sink)
	const s = nodeSize ?? 20
	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{(showHelpers ?? false) && (
				<g>
					{/* Border */}
					<path
						d={`M 1,1 L ${width - 1},1 L ${width - 1},${height - 1} 1,${
							height - 1
						} L 1,1`}
						stroke-width={1}
						fill={'none'}
						stroke={Colors.helpers}
						stroke-dasharray="2 2"
					/>
					{/* Center */}
					<path
						d={`M 1,${height / 2} L ${width - 1},${height / 2}`}
						stroke-width={1}
						fill={'none'}
						stroke={Colors.helpers}
						stroke-dasharray="2 2"
					/>
					<path
						d={`M ${width / 2},1 L ${width / 2},${height - 1}`}
						stroke-width={1}
						fill={'none'}
						stroke={Colors.helpers}
						stroke-dasharray="2 2"
					/>
				</g>
			)}

			{/* Draw connections */}
			{sinkNodes.map((node) => (
				<NodeConnections x={s} y={s} topology={topology} node={node} />
			))}
			{/* Draw nodes */}
			{sinkNodes.map((node) => (
				<ConnectedNode x={s} y={s} topology={topology} node={node} size={s} />
			))}
		</svg>
	)
}

const Node = ({
	x,
	y,
	node,
	size: s,
}: {
	x: number
	y: number
	node: NRPlusNodeInfo
	size: number
}) => (
	<g>
		<path
			fill={Colors.cellular}
			d={`M ${x - s / 2},${y - s / 2} l ${s},0 l 0,${s} l ${-s},0 l 0,${-s}`}
		/>
		<text
			fill={Colors.text}
			font-size={'10'}
			x={x}
			y={y + 4}
			text-anchor="middle"
		>
			{node.id}
		</text>
		<text
			fill={Colors.cellular}
			font-size={'10'}
			x={x}
			y={y + 24}
			text-anchor="middle"
		>
			{node.title}
		</text>
	</g>
)

const connectedNodes = ({
	node,
	topology,
	x,
	y,
	startAngle,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	startAngle?: number
}): {
	connectionNodes: {
		x: number
		y: number
		angle: number
		node: NRPlusNodeInfo
	}[]
} => {
	const incomingConnections = topology.connections.filter(
		({ to }) => to === node.id,
	)
	const angleStep = Math.PI / 6
	let angle = startAngle ?? 0
	const connectionNodes: {
		x: number
		y: number
		angle: number
		node: NRPlusNodeInfo
	}[] = []
	for (const connection of incomingConnections) {
		const connectedNode = topology.nodes.find(
			({ id }) => id === connection.from,
		)
		connectionNodes.push({
			node: connectedNode ?? {
				id: connection.from,
				title: connection.from.toString(),
			},
			x: x + connection.distance * 10 * Math.cos(angle),
			y: y + connection.distance * 10 * Math.sin(angle),
			angle,
		})
		angle += angleStep
	}

	return { connectionNodes }
}

const NodeConnections = ({
	node,
	topology,
	x,
	y,
	startAngle,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	startAngle?: number
}) => {
	const { connectionNodes } = connectedNodes({
		node,
		topology,
		x,
		y,
		startAngle,
	})
	return (
		<g>
			{connectionNodes.map((conn) => (
				<g>
					<path
						d={`M ${x},${y} L ${conn.x},${conn.y}`}
						stroke-width={1}
						stroke={Colors.connection}
						stroke-dasharray="2 2"
					/>
					<NodeConnections
						x={conn.x}
						y={conn.y}
						node={conn.node}
						topology={topology}
						startAngle={conn.angle}
					/>
				</g>
			))}
		</g>
	)
}

const ConnectedNode = ({
	node,
	topology,
	x,
	y,
	startAngle,
	size,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	startAngle?: number
	size: number
}) => {
	const { connectionNodes } = connectedNodes({
		node,
		topology,
		x,
		y,
		startAngle,
	})
	return (
		<g>
			<Node x={x} y={y} node={node} key={node.id} size={size} />
			{connectionNodes.map((conn) => (
				<g>
					<Node
						x={conn.x}
						y={conn.y}
						node={conn.node}
						key={conn.node.id}
						size={size}
					/>
					<ConnectedNode
						x={conn.x}
						y={conn.y}
						node={conn.node}
						topology={topology}
						startAngle={conn.angle}
						size={size}
					/>
				</g>
			))}
		</g>
	)
}
