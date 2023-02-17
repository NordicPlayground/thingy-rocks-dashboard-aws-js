import { buildTree } from './buildTree'
import { layoutMesh, PlacedMeshNode } from './layoutMesh'
import network from './network.json'

const byId = (id: number) => (node: PlacedMeshNode) => node.node === id

describe('layoutMesh()', () => {
	it('should layout a mesh network', () => {
		const layout = layoutMesh(buildTree(network))

		// The hop 1 nodes should be circled around the center (gateway)

		const node6975800500 = layout.find(byId(6975800500))
		expect(node6975800500?.x).toEqual(-9.184850993605149e-15)
		expect(node6975800500?.y).toEqual(75)
		expect(node6975800500?.heading).toEqual(-Math.PI)

		const node4048965118 = layout.find(byId(4048965118))
		expect(node4048965118?.x.toFixed(5)).toEqual(
			(-58.63736118510224).toFixed(5),
		)
		expect(node4048965118?.y.toFixed(5)).toEqual(
			(46.761735139405005).toFixed(5),
		)
	})

	/**
	 *    422
	 *     |
	 *     |
	 *     0
	 */
	it('should layout a mesh network with on node', () => {
		const layout = layoutMesh(
			buildTree([
				{
					node: 422,
					travelTimeMs: Math.round(Math.random() * 100),
					hops: 1,
				},
			]),
		)

		const node422 = layout.find(byId(422))
		expect(node422).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -75,
		})
	})

	/**
	 *    422
	 *     |
	 *     |
	 *     0
	 *     |
	 *     |
	 *    423
	 */
	it('should layout a mesh network with two nodes', () => {
		const layout = layoutMesh(
			buildTree([
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
			]),
		)
		const node422 = layout.find(byId(422))
		expect(node422).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -75,
		})

		const node423 = layout.find(byId(423))
		expect(node423).toMatchObject({
			heading: degToRad(180),
			x: 0,
			y: 75,
		})
	})

	/**
	 *   4222
	 *     |
	 *     |
	 *    422
	 *     |
	 *     |
	 *     0
	 */
	it.only('should layout a mesh network with two nodes', () => {
		const layout = layoutMesh(
			buildTree([
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
			]),
		)
		const node422 = layout.find(byId(422))
		expect(node422).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -75,
		})

		const node4222 = layout.find(byId(4222))
		expect(node4222).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -150,
		})
	})

	/**
	 * 4222 43222
	 *   \   /
	 *    \ /
	 *    422
	 *     |
	 *     |
	 *     0
	 *     |
	 *     |
	 *    423
	 */
	it('should layout a simple mesh network with two hops', () => {
		const layout = layoutMesh(
			buildTree([
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
			]),
		)

		const node422 = layout.find(byId(422))
		expect(node422).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -75,
		})
		const node4322 = layout.find(byId(4322))
		expect(node4322).toMatchObject({
			heading: degToRad(45),
		})
	})

	/**
	 *      422
	 *       |
	 *       |
	 *       0
	 *      / \
	 *     /   \
	 *   423    424
	 */
	it('should layout a simple mesh with three nodes', () => {
		const layout = layoutMesh(
			buildTree([
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
			]),
		)

		const node422 = layout.find(byId(422))
		expect(node422).toMatchObject({
			heading: degToRad(0),
			x: 0,
			y: -75,
		})
		const node423 = layout.find(byId(423))
		expect(node423).toMatchObject({
			heading: degToRad(120),
		})
		const node424 = layout.find(byId(424))
		expect(node424).toMatchObject({
			heading: degToRad(240),
		})
	})
})

const degToRad = (angle: number): number => (angle * Math.PI) / 180
