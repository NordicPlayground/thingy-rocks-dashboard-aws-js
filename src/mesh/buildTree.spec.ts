import { buildTree, ConnectedMeshNode } from './buildTree'
import network from './network.json'
import network2 from './network2.json'

describe('buildTree()', () => {
	it('should build a mesh tree', () => {
		expect(buildTree(network)).toMatchObject(<ConnectedMeshNode[]>[
			{
				node: 6975800500,
				travelTimeMs: 74,
				hops: 1,
				connections: [
					{ node: 2829817032, travelTimeMs: 80, hops: 2, connections: [] },
				],
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
						connections: [
							{ node: 1820146670, travelTimeMs: 52, hops: 3, connections: [] },
							{ node: 6520358329, travelTimeMs: 71, hops: 3, connections: [] },
							{ node: 7608983301, travelTimeMs: 3, hops: 3, connections: [] },
							{ node: 8318068215, travelTimeMs: 40, hops: 3, connections: [] },
						],
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
							{ node: 5734953533, travelTimeMs: 81, hops: 3, connections: [] },
						],
					},
				],
			},
			{ node: 9318949199, travelTimeMs: 28, hops: 1, connections: [] },
			{ node: 5512195090, travelTimeMs: 52, hops: 1, connections: [] },
			{
				node: 8987064997,
				travelTimeMs: 33,
				hops: 1,
				connections: [
					{ node: 2332026697, travelTimeMs: 37, hops: 2, connections: [] },
				],
			},
			{ node: 7595079339, travelTimeMs: 76, hops: 1, connections: [] },
		])
	})

	describe('auto connect all nodes', () => {
		it('should connect all nodes', () =>
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

		it('should not connect the layer 2 node to more than one', () => {
			const tree = buildTree([
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
			])

			expect(tree).toHaveLength(3)
			expect(tree.filter((node) => node.connections.length === 1)).toHaveLength(
				1,
			)
		})

		it('should connect all nodes (deep sample)', () => {
			// This sample has nodes with 4 and 5 hops that have no direct route based on the device ids of parents. They have to be connected randomly.
			const tree = buildTree(network2)
			const hop3Nodes: ConnectedMeshNode[] = []
			const hop4Nodes: ConnectedMeshNode[] = []
			const hop5Nodes: ConnectedMeshNode[] = []
			walkTree(tree, (node) => {
				if (node.hops === 3) hop3Nodes.push(node)
				if (node.hops === 4) hop4Nodes.push(node)
				if (node.hops === 5) hop5Nodes.push(node)
			})
			expect(hop3Nodes).toHaveLength(1)
			expect(hop4Nodes).toHaveLength(2)
			expect(hop5Nodes).toHaveLength(1)
		})
	})
})

const walkTree = (
	tree: ConnectedMeshNode[],
	onNode: (node: ConnectedMeshNode, parent?: ConnectedMeshNode) => unknown,
	parent?: ConnectedMeshNode,
) => {
	for (const node of tree) {
		onNode(node, parent)
		walkTree(node.connections, onNode, node)
	}
}
