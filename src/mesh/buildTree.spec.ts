import { buildTree, ConnectedMeshNode } from './buildTree'
import network from './network.json'

describe('buildTree()', () => {
	it('should build a mesh tree', () => {
		expect(buildTree(network)).toMatchObject(<ConnectedMeshNode[]>[
			{
				node: 6975800500,
				travelTimeMs: 74,
				connections: [],
			},
			{
				node: 4048965118,
				travelTimeMs: 95,
				connections: [
					{
						node: 4007609668,
						travelTimeMs: 78,
						connections: [],
					},
				],
			},
			{
				node: 5472051413,
				travelTimeMs: 27,
				connections: [
					{
						node: 4785281453,
						travelTimeMs: 77,
						connections: [
							{
								node: 5734953533,
								travelTimeMs: 81,
								connections: [],
							},
						],
					},
				],
			},
			{
				node: 9318949199,
				travelTimeMs: 28,
				connections: [],
			},
			{
				node: 5512195090,
				travelTimeMs: 52,
				connections: [],
			},
			{
				node: 8987064997,
				travelTimeMs: 33,
				connections: [
					{
						node: 2332026697,
						travelTimeMs: 37,
						connections: [],
					},
				],
			},
			{
				node: 7595079339,
				travelTimeMs: 76,
				connections: [],
			},
		])
	})
})
