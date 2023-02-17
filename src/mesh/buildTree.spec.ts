import { buildTree, ConnectedMeshNode } from './buildTree'
import network from './network.json'

describe('buildTree()', () => {
	it('should build a mesh tree', () => {
		expect(buildTree(network)).toMatchObject(<ConnectedMeshNode[]>[
			{
				node: 6975800500,
				travelTimeMs: 74,
				connections: [],
				hops: 1,
			},
			{
				node: 4048965118,
				travelTimeMs: 95,
				hops: 1,
				connections: [
					{
						node: 4007609668,
						travelTimeMs: 78,
						hops: 2,
						connections: [],
					},
				],
			},
			{
				node: 5472051413,
				travelTimeMs: 27,
				hops: 1,
				connections: [
					{
						node: 4785281453,
						travelTimeMs: 77,
						hops: 2,
						connections: [
							{
								node: 5734953533,
								travelTimeMs: 81,
								hops: 3,
								connections: [],
							},
						],
					},
				],
			},
			{
				node: 9318949199,
				travelTimeMs: 28,
				hops: 1,
				connections: [],
			},
			{
				node: 5512195090,
				travelTimeMs: 52,
				hops: 1,
				connections: [],
			},
			{
				node: 8987064997,
				travelTimeMs: 33,
				hops: 1,
				connections: [
					{
						node: 2332026697,
						travelTimeMs: 37,
						hops: 2,
						connections: [],
					},
				],
			},
			{
				node: 7595079339,
				travelTimeMs: 76,
				hops: 1,
				connections: [],
			},
		])
	})

	it.only('should connect all nodes', () =>
		expect(
			buildTree([
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
			]),
		).toMatchObject(<ConnectedMeshNode[]>[
			{
				node: 6975800500,
				travelTimeMs: 74,
				hops: 1,
				connections: [
					{
						node: 6975800502,
						travelTimeMs: 37,
						hops: 2,
						connections: [],
					},
				],
			},
		]))
})
