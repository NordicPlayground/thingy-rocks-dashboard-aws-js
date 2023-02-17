import type { MeshNodeInfo } from './context/Devices'

const randomNodeId = () => {
	const id = []
	do {
		id.push(Math.round(Math.random() * 10))
	} while (id.length < 10)

	return parseInt(id.join(''), 10)
}

const nodes: MeshNodeInfo[] = []
for (let i = 0; i < 15; i++) {
	nodes.push({
		gateway: 'demo5Gmesh_gw01',
		node: randomNodeId(),
		rxTime: new Date().toISOString(),
		travelTimeMs: Math.round(Math.random() * 100),
		hops: Math.ceil(Math.random() * 3),
	})
}

const width = 100
const height = 100

export const MeshVisulization = () => {
	return (
		<main class="text-white">
			<section>
				<ul>
					{nodes.map((node) => (
						<li>
							{node.node} hops: {node.hops}
						</li>
					))}
				</ul>
			</section>
			<aside class="px-4 py-4">
				<svg
					width={width}
					height={height}
					viewBox={`0 0 ${width} ${height}`}
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g>
						{/*graph.mapEdges((edge, attributes, source, target) => {
							const { x: fromX, y: fromY } = positions[source] ?? { x: 0, y: 0 }
							const { x: toX, y: toY } = positions[target] ?? { x: 0, y: 0 }
							console.log([fromX, fromY], [toX, toY])
							return (
								<path
									style={`stroke:#ffffff;stroke-width:0.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;fill:none`}
									d={`m ${fromY},${fromX} L ${toY},${toX}`}
								/>
							)
						})*/}
					</g>
				</svg>
			</aside>
		</main>
	)
}
