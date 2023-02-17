import { buildTree } from './buildTree'
import { layoutMesh, move, PlacedMeshNode } from './layoutMesh'
import network from './network.json'

const byId = (id: number) => (node: PlacedMeshNode) => node.node === id

describe('layoutMesh()', () => {
	it('should layout a mesh network', () => {
		const layout = layoutMesh(buildTree(network))

		// The hop 1 nodes should be circled around the center (gateway)

		const node6975800500 = layout.find(byId(6975800500))
		expect(node6975800500?.x).toEqual(0)
		expect(node6975800500?.y).toEqual(-74)
		expect(node6975800500?.heading).toEqual(0)

		const node4048965118 = layout.find(byId(4048965118))
		// Move by 1/7 CW
		const thirdCircle = (Math.PI * 2) / 7
		const node4048965118Pos = move({
			x: 0,
			y: 0,
			heading: thirdCircle,
			distance: 95,
		})
		expect(node4048965118).toMatchObject(node4048965118Pos)
		expect(node4048965118?.heading).toEqual(thirdCircle)
	})
})
