import { useState } from 'preact/hooks'
import type { MeshNetwork } from './buildTree'
import { MeshTopology } from './MeshTopology'
import network from './network.json'
import network2 from './network2.json'

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

const samples: [title: string, network: MeshNetwork][] = [
	[
		'Single node',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
		],
	],
	[
		'Two nodes (connected)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 4222,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
		],
	],
	[
		'Two nodes (level 1)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 423,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
		],
	],
	[
		'Three nodes (level 1)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 423,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 424,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
		],
	],
	[
		'Connect all nodes (1)',
		[
			{
				node: 6975800500,
				travelTimeMs: 74,
				hops: 1,
			},
			{
				node: 6975800502,
				travelTimeMs: 37,
				hops: 2,
			},
		],
	],
	[
		'Connect all nodes (2)',
		[
			{
				node: 7804,
				travelTimeMs: 74,
				hops: 1,
			},
			{
				node: 3189,
				travelTimeMs: 74,
				hops: 1,
			},
			{
				node: 3128,
				travelTimeMs: 74,
				hops: 1,
			},
			// Should only be connected to one of the three nodes
			{
				node: 996,
				travelTimeMs: 74,
				hops: 2,
			},
		],
	],
	[
		'Circular distribution (1)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 4222,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
			{
				node: 4322,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
		],
	],
	[
		'Circular distribution (2)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 4222,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
			{
				node: 4322,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
			{
				node: 423,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
		],
	],
	[
		'Circular distribution (3)',
		[
			{
				node: 422,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 4222,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
			{
				node: 4322,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 2,
			},
			{
				node: 43222,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 3,
			},
			{
				node: 43322,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 3,
			},

			{
				node: 425,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
			{
				node: 426,
				travelTimeMs: Math.round(Math.random() * 100),
				hops: 1,
			},
		],
	],
	['Test sample', network],
	['Test sample (many hops)', network2],
]

const angleTests: [title: string, network: MeshNetwork][] = [
	...Array.from(
		{ length: 10 },
		(_, k): [title: string, network: MeshNetwork] => [
			`Angle test: ${k}`,
			[
				{
					node: 422,
					travelTimeMs: Math.round(Math.random() * 100),
					hops: 1,
				},
				...Array.from({ length: k }, () => ({
					node: 4002 + k * 10,
					travelTimeMs: Math.round(Math.random() * 100),
					hops: 2,
				})),
				...Array.from({ length: k }, () => ({
					node: 40002 + k * 10,
					travelTimeMs: Math.round(Math.random() * 100),
					hops: 3,
				})),
			],
		],
	),
]

export const MeshVisualizer = () => {
	const [randomNodes, setNodes] = useState<MeshNetwork>(randomNetwork())

	return (
		<main class="text-white">
			<div class="row mt-4">
				{samples.map(([title, network]) => (
					<section class="col">
						<p>{title}</p>
						<MeshTopology network={network} />
					</section>
				))}
				<section class="col">
					<p>Random (click to regenerate)</p>
					<MeshTopology
						network={randomNodes}
						onClick={() => {
							setNodes(randomNetwork())
						}}
					/>
				</section>
			</div>
			<div class="row mt-4">
				{angleTests.map(([title, network]) => (
					<section class="col">
						<p>{title}</p>
						<MeshTopology network={network} />
					</section>
				))}
			</div>
		</main>
	)
}
