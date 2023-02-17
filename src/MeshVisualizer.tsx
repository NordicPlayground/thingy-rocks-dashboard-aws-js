import { useEffect, useState } from 'preact/hooks'
import { buildTree, MeshNetwork } from './mesh/buildTree'
import { layoutMesh } from './mesh/layoutMesh'
import { normalizePositions } from './mesh/normalizePositions'

const randomNodeId = () =>
	parseInt(
		Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join(''),
		10,
	)

const randomNetwork = (): MeshNetwork => {
	const nodes: MeshNetwork = []

	for (let i = 0; i <= 15; i++) {
		nodes.push({
			node: randomNodeId(),
			travelTimeMs: Math.round(Math.random() * 100),
			hops: Math.ceil(Math.random() * 3),
		})
	}
	return nodes
}

export const MeshVisualizer = () => {
	const [nodes, setNodes] = useState<MeshNetwork>(randomNetwork())

	useEffect(() => {
		const i = setInterval(() => {
			setNodes(randomNetwork())
		}, 500)
		return () => {
			clearInterval(i)
		}
	})

	const {
		center,
		elements,
		box: { width: w, height: h },
	} = normalizePositions(
		layoutMesh(buildTree(nodes), Math.random() * Math.PI * 2),
		10,
	)

	return (
		<main class="text-white">
			<div class="row mt-4">
				<aside class="col">
					<ul>
						{nodes.map(({ node, hops, travelTimeMs }) => (
							<li>
								{node}, hops: {hops}, rxTime: {travelTimeMs}
							</li>
						))}
					</ul>
					<ul>
						{elements.map(({ node, x, y }) => (
							<li>
								{node}, {x}x{y}
							</li>
						))}
					</ul>
				</aside>
				<section class="col">
					<svg
						width={w}
						height={h}
						viewBox={`0 0 ${w} ${h}`}
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g>
							{/*
							<path
								style={`stroke:#ff0000;stroke-width:1;fill:none`}
								d={`M 0,0 h ${w} v ${h} h ${-w} v${-h}`}
							/>
							 */}
							<circle
								style={`fill:#ff0000;stroke:#ff0000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;paint-order:markers fill stroke`}
								cy={Math.round(center.y)}
								cx={Math.round(center.x)}
								r="6"
							/>
							{elements.map(({ x, y, parent }) => {
								const parentNode =
									elements.find(({ node }) => node === parent) ?? center

								return (
									<>
										<circle
											style={`fill:none;stroke:#ff0000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;paint-order:markers fill stroke`}
											cy={Math.round(y)}
											cx={Math.round(x)}
											r="6"
										/>
										<path
											style={`stroke:#ff0000;stroke-width:1;fill:none`}
											d={`M ${Math.round(parentNode.x)},${Math.round(
												parentNode.y,
											)} L ${Math.round(x)},${Math.round(y)}`}
										/>
									</>
								)
							})}
						</g>
					</svg>
				</section>
			</div>
		</main>
	)
}
