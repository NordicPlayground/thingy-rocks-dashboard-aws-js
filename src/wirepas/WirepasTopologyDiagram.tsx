import type { ComponentChildren } from 'preact'
import { formatId } from './formatId.js'
import { Colors } from '../nrplus/Colors.js'
import { Helpers } from '../nrplus/Helpers.js'
import type { Connection } from './parseWirepasNodes.js'

export const WirepasTopologyDiagram = ({
	connections,
	showHelpers,
	size: { width, height },
	distance,
}: {
	connections: Connection[]
	showHelpers?: boolean
	size: { width: number; height: number }
	distance?: number
}) => {
	const targets = connections.map(({ to }) => to)
	const sources = connections.map(({ from }) => from)

	const sinks = [...new Set(targets.filter((id) => !sources.includes(id)))]
	if (sinks.length > 1)
		console.warn(
			`[WirepasTopology]`,
			`More than one sink is currently not supported.`,
		)
	const sinkId = sinks[0] as string

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
		>
			{(showHelpers ?? false) && <Helpers width={width} height={height} />}
			<Move x={width / 2} y={height / 2}>
				<Node id={sinkId} connections={connections} distance={distance ?? 90} />
			</Move>
		</svg>
	)
}

const Node = ({
	id,
	size,
	connections,
	baseAngle,
	distance,
}: {
	id: string
	size?: number
	baseAngle?: number
	connections: Connection[]
	distance: number
}) => {
	const s = size ?? 40
	return (
		<g>
			<Peers
				id={id}
				connections={connections}
				baseAngle={baseAngle}
				distance={distance}
			/>
			<Hexagon size={s / 2} />
			<text
				fill={Colors.text}
				font-size={'10'}
				x={0}
				y={0 + 4}
				text-anchor="middle"
			>
				{formatId(id)}
			</text>
		</g>
	)
}

const Move = ({
	children,
	x,
	y,
}: {
	children: ComponentChildren
	x: number
	y: number
}) => <g transform={`translate(${x} ${y})`}>{children}</g>

const Rotate = ({
	children,
	angle,
}: {
	children: ComponentChildren
	angle: number
}) => <g transform={`rotate(${angle})`}>{children}</g>

const Hexagon = ({ size }: { size: number }) => {
	const points: [number, number][] = []
	let theta, x, y
	const rotation = Math.PI / 6
	for (let i = 0; i < 6; i++) {
		theta = (i / 6) * (2 * Math.PI) + rotation
		x = size * Math.cos(theta)
		y = size * Math.sin(theta)

		points.push([x, y])
	}
	points.push(points[0] as [number, number]) // Close circle
	const [start, ...rest] = points
	const [startX, startY] = start as [number, number]
	return (
		<path
			d={`M ${startX},${startY} ${rest.map(([x, y]) => `L ${x},${y}`)}`}
			fill={Colors.cellular}
		/>
	)
}

const Peers = ({
	id,
	connections,
	baseAngle,
	distance,
}: {
	id: string
	connections: Connection[]
	distance: number
	baseAngle?: number
}) => {
	const peers = connections.filter(({ to }) => to === id)

	let delta = 0
	if (peers.length > 1) delta = -(baseAngle ?? 0) / 4
	const angle = (baseAngle ?? 360) / peers.length

	return (
		<g>
			{peers.map((peer) => {
				const rotation = delta
				delta += angle
				return (
					<Rotate angle={rotation}>
						<Move x={distance / 2} y={0}>
							<text
								fill={Colors.connection}
								font-size={'10'}
								x={0}
								y={10}
								text-anchor="middle"
							>
								{peer.lat} ms
							</text>
						</Move>
						<path
							d={`m 0,0 l ${distance},0`}
							stroke-width={1}
							stroke={Colors.connection}
							stroke-dasharray="2 2"
						/>
						<Move x={distance} y={0}>
							<Node
								id={peer.from}
								connections={connections}
								baseAngle={angle * 2}
								distance={distance}
							/>
						</Move>
					</Rotate>
				)
			})}
		</g>
	)
}
