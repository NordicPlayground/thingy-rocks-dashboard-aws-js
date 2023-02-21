import type { ComponentProps } from 'preact'
import { buildTree, MeshNetwork } from './buildTree'
import { isGateway, isNode, layoutMesh, move } from './layoutMesh'
import { normalizePositions } from './normalizePositions'

export const MeshTopology = ({
	network,
	...props
}: {
	network: MeshNetwork
} & ComponentProps<any>) => {
	const distance = 120
	const {
		center,
		elements,
		box: { width: w, height: h },
	} = normalizePositions(layoutMesh(buildTree(network), distance), 50)

	const gw = elements.find(isGateway)

	return (
		<svg
			width={w}
			height={h}
			viewBox={`0 0 ${w} ${h}`}
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g>
				{elements
					.filter(isNode)
					.map(({ x, y, parent, node, heading, travelTimeMs }) => {
						const parentNode =
							elements.find(({ node }) => node === parent) ?? center

						// shorten the line
						const lineStart = move({
							x: parentNode.x,
							y: parentNode.y,
							distance: Math.min(25, distance / 2),
							heading,
						})
						const lineEnd = move({
							x,
							y,
							distance: -Math.min(20, distance / 2),
							heading,
						})
						// Travel time label position
						const labelPos = move({
							x,
							y,
							distance: -distance / 2,
							heading,
						})

						return (
							<>
								<path
									d={`M ${lineStart.x},${lineStart.y} L ${lineEnd.x},${lineEnd.y}`}
									stroke={'#949599'}
									stroke-width={1}
									fill={'none'}
									stroke-dasharray={'5 3'}
									stroke-opacity={0.75}
								/>
								<g
									transform={[
										`translate(${x - 14} ${y - 14})`,
										'scale(0.4 0.4)',
									].join('\n')}
								>
									<path
										d="M 1.8496094 0 C 0.82960934 0 1.4802974e-16 0.82960935 0 1.8496094 L 0 67.859375 C 0 68.879375 0.82960935 69.710937 1.8496094 69.710938 L 67.769531 69.710938 C 68.789531 69.710938 69.619141 68.879375 69.619141 67.859375 L 69.619141 1.8496094 C 69.619141 0.82960934 68.789531 1.4802974e-16 67.769531 0 L 1.8496094 0 z M 14.439453 7.8808594 C 18.059453 7.8808594 21 10.829219 21 14.449219 C 21 18.069219 18.059453 21.019531 14.439453 21.019531 C 10.819453 21.019531 7.8808594 18.079219 7.8808594 14.449219 C 7.8808594 10.819219 10.819453 7.8808594 14.439453 7.8808594 z "
										fill={'#f48120'}
									/>
								</g>
								<text
									x={x}
									y={y + 9}
									text-anchor="middle"
									font-size={10}
									fill={'#000000'}
								>
									#{node.toString().slice(-3)}
								</text>
								<text
									x={labelPos.x}
									y={labelPos.y}
									text-anchor="middle"
									font-size={12}
									fill={'#d1203a'}
									stroke="#000000"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-miterlimit="2"
									stroke-opacity="1"
									paint-order="stroke fill markers"
								>
									{travelTimeMs}ms
								</text>
							</>
						)
					})}
				{/* Gateway */}
				{gw !== undefined && (
					<g
						transform={[
							`translate(${gw.x - 20} ${gw.y - 11})`,
							'scale(0.1 0.1)',
						].join('\n')}
					>
						<path
							opacity={1}
							fill={'#0054a1'}
							fill-opacity={1}
							stroke-width={1}
							stroke-linecap={'round'}
							stroke-linejoin={'round'}
							paint-order={'stroke fill markers'}
							stop-color={'#000000'}
							d="M 4.6757812 0 C 2.0857239 0 0 2.0837595 0 4.6738281 L 0 158.10156 L 76.158203 234.25977 L 394.0957 234.25977 C 396.68574 234.25977 398.77148 232.17406 398.77148 229.58398 L 398.77148 4.6738281 C 398.77148 2.0837595 396.68574 0 394.0957 0 L 4.6757812 0 z "
						/>
					</g>
				)}
			</g>
		</svg>
	)
}
