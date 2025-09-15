import { Colors } from './Colors.js'
import { Helpers } from './Helpers.js'
import {
	type NRPlusNetworkTopology,
	type NRPlusNodeInfo,
} from './parseTopology.js'

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

	// Calculate sink position (center of view)
	const sinkX = width / 2
	const sinkY = height / 2

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{(showHelpers ?? false) && <Helpers width={width} height={height} />}

			{/* Draw sink-to-leaf topology */}
			{sinkNodes.map((sinkNode) => (
				<SinkTopology
					key={sinkNode.id}
					sink={sinkNode}
					topology={topology}
					sinkX={sinkX}
					sinkY={sinkY}
					size={s}
					viewWidth={width}
					viewHeight={height}
				/>
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

const SinkTopology = ({
	sink,
	topology,
	sinkX,
	sinkY,
	size,
	viewWidth,
	viewHeight,
}: {
	sink: NRPlusNodeInfo
	topology: NRPlusNetworkTopology
	sinkX: number
	sinkY: number
	size: number
	viewWidth: number
	viewHeight: number
}) => {
	// Find all nodes that connect TO the sink (neighbors that the sink can see)
	const neighborConnections = topology.connections.filter(
		({ to }) => to === sink.id,
	)

	// Get the actual neighbor nodes
	const neighborNodes = neighborConnections.map((connection) => {
		const node = topology.nodes.find(({ id }) => id === connection.from)
		return {
			node: node ?? {
				id: connection.from,
				title: connection.from.toString(),
			},
			distance: connection.distance,
		}
	})

	// Calculate positions for neighbor nodes in a circle around the sink
	const radius = Math.min(viewWidth, viewHeight) * 0.3
	const angleStep =
		neighborNodes.length > 0 ? (2 * Math.PI) / neighborNodes.length : 0

	return (
		<g>
			{/* Draw lines from sink to each neighbor */}
			{neighborNodes.map(({ node }, index) => {
				const angle = index * angleStep
				const neighborX = sinkX + radius * Math.cos(angle)
				const neighborY = sinkY + radius * Math.sin(angle)

				return (
					<g key={node.id}>
						{/* Connection line */}
						<path
							d={`M ${sinkX},${sinkY} L ${neighborX},${neighborY}`}
							stroke={Colors.connection}
							stroke-width={1}
							stroke-dasharray="2 2"
						/>
						{/* Neighbor node */}
						<Node x={neighborX} y={neighborY} node={node} size={size} />
					</g>
				)
			})}

			{/* Draw sink node on top */}
			<Node x={sinkX} y={sinkY} node={sink} size={size} />
		</g>
	)
}
