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
	showHelpers,
}: {
	topology: NRPlusNetworkTopology
	size: { width: number; height: number }
	showHelpers?: boolean
}) => {
	// Start with the sink nodes, for now we assume only one sink
	const sinkNodes = topology.nodes.filter(({ sink }) => sink)
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
				<NodeConnections
					x={width / 2}
					y={height / 2}
					topology={topology}
					node={node}
				/>
			))}
			{/* Draw nodes */}
			{sinkNodes.map((node) => (
				<ConnectedNode
					x={width / 2}
					y={height / 2}
					topology={topology}
					node={node}
				/>
			))}
		</svg>
	)
}

const Node = ({
	x,
	y,
	node,
	size,
}: {
	x: number
	y: number
	node: NRPlusNodeInfo
	size?: number
}) => {
	const s = size ?? 20
	return (
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
}

const connectedNodes = ({
	node,
	topology,
	x,
	y,
	fov,
	startAngle,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	fov?: number
	startAngle?: number
}): {
	connectionNodes: {
		x: number
		y: number
		angle: number
		node: NRPlusNodeInfo
	}[]
	angleStep: number
} => {
	const incomingConnections = topology.connections.filter(
		({ to }) => to === node.id,
	)
	const angleStep = (fov ?? Math.PI * 2) / incomingConnections.length
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

	return { connectionNodes, angleStep }
}

const NodeConnections = ({
	node,
	topology,
	x,
	y,
	fov,
	startAngle,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	fov?: number
	startAngle?: number
}) => {
	const { connectionNodes, angleStep } = connectedNodes({
		node,
		topology,
		x,
		y,
		fov,
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
						fov={angleStep}
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
	fov,
	startAngle,
}: {
	x: number
	y: number
	topology: NRPlusNetworkTopology
	node: NRPlusNodeInfo
	fov?: number
	startAngle?: number
}) => {
	const { connectionNodes, angleStep } = connectedNodes({
		node,
		topology,
		x,
		y,
		fov,
		startAngle,
	})
	return (
		<g>
			<Node x={x} y={y} node={node} key={node.id} />
			{connectionNodes.map((conn) => (
				<g>
					<Node x={conn.x} y={conn.y} node={conn.node} key={conn.node.id} />
					<ConnectedNode
						x={conn.x}
						y={conn.y}
						node={conn.node}
						topology={topology}
						fov={angleStep}
						startAngle={conn.angle}
					/>
				</g>
			))}
		</g>
	)
}
