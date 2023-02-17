import { useEffect, useState } from 'preact/hooks'
import type { MeshNetwork } from './buildTree'
import { MeshTopology } from './MeshTopology'

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
	const [randomNodes, setNodes] = useState<MeshNetwork>(randomNetwork())
	useEffect(() => {
		const i = setInterval(() => {
			setNodes(randomNetwork())
		}, 500)
		return () => {
			clearInterval(i)
		}
	})
	/*
	const nodes: MeshNetwork = [
		{
			node: 6975800500,
			travelTimeMs: 74,
			hops: 1,
		},
		{
			node: 4048965118,
			travelTimeMs: 95,
			hops: 1,
		},
		{
			node: 2829817032,
			travelTimeMs: 80,
			hops: 2,
		},
		{
			node: 5472051413,
			travelTimeMs: 27,
			hops: 1,
		},
		{
			node: 4785281453,
			travelTimeMs: 77,
			hops: 2,
		},
		{
			node: 9318949199,
			travelTimeMs: 28,
			hops: 1,
		},
		{
			node: 1820146670,
			travelTimeMs: 52,
			hops: 3,
		},
		{
			node: 4007609668,
			travelTimeMs: 78,
			hops: 2,
		},
		{
			node: 6520358329,
			travelTimeMs: 71,
			hops: 3,
		},
		{
			node: 2332026697,
			travelTimeMs: 37,
			hops: 2,
		},
		{
			node: 5512195090,
			travelTimeMs: 52,
			hops: 1,
		},
		{
			node: 7608983301,
			travelTimeMs: 3,
			hops: 3,
		},
		{
			node: 8987064997,
			travelTimeMs: 33,
			hops: 1,
		},
		{
			node: 7595079339,
			travelTimeMs: 76,
			hops: 1,
		},
		{
			node: 5734953533,
			travelTimeMs: 81,
			hops: 3,
		},
		{
			node: 8318068215,
			travelTimeMs: 40,
			hops: 3,
		},
	]
	*/

	/*
	const nodes: MeshNetwork = [
		{
			node: 422,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 1,
		},
		{
			node: 427,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 1,
		},
		{
			node: 412,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 2,
		},
		{
			node: 402,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 2,
		},
		{
			node: 482,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 2,
		},
		{
			node: 512,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 3,
		},
		{
			node: 502,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 3,
		},
		{
			node: 822,
			travelTimeMs: Math.round(Math.random() * 100),
			hops: 3,
		},
	]
	*/

	return (
		<main class="text-white">
			<div class="row mt-4">
				<section class="col">
					<MeshTopology
						network={[
							{
								node: 422,
								travelTimeMs: Math.round(Math.random() * 100),
								hops: 1,
							},
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
							{
								node: 422,
								travelTimeMs: Math.round(Math.random() * 100),
								hops: 1,
							},
							{
								node: 4202,
								travelTimeMs: Math.round(Math.random() * 100),
								hops: 2,
							},
							{
								node: 4212,
								travelTimeMs: Math.round(Math.random() * 100),
								hops: 2,
							},
						]}
					/>
				</section>
				<section class="col">
					<MeshTopology
						network={[
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
						]}
					/>
				</section>
			</div>
			<div class="row">
				{' '}
				<section class="col">
					<MeshTopology network={randomNodes} />
				</section>
			</div>
		</main>
	)
}
