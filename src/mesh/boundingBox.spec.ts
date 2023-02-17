import { boundingBox } from './boundingBox'

describe('boundingBox()', () => {
	it('should calculate the bounding box for all positions in the list', () =>
		expect(
			boundingBox([
				{
					x: 59.41919266757027,
					y: 0,
					node: 6975800500,
					travelTimeMs: 74,
					connections: [],
					heading: 0,
					parent: undefined,
				},
				{
					x: 133.6931835020331,
					y: 14.768468823420307,
					node: 4048965118,
					travelTimeMs: 95,
					connections: [[Object]],
					heading: 0.8975979010256552,
					parent: undefined,
				},
				{
					x: 85.74224629647951,
					y: 80.00806521682048,
					node: 5472051413,
					travelTimeMs: 27,
					connections: [[Object]],
					heading: 1.7951958020513104,
					parent: undefined,
				},
				{
					x: 71.5679373628619,
					y: 99.22712830126773,
					node: 9318949199,
					travelTimeMs: 28,
					connections: [],
					heading: 2.6927937030769655,
					parent: undefined,
				},
				{
					x: 36.85723823345725,
					y: 120.8503811309258,
					node: 5512195090,
					travelTimeMs: 52,
					connections: [],
					heading: 3.5903916041026207,
					parent: undefined,
				},
				{
					x: 27.246571565570093,
					y: 81.34319082055838,
					node: 8987064997,
					travelTimeMs: 33,
					connections: [[Object]],
					heading: 4.487989505128276,
					parent: undefined,
				},
				{
					x: 0,
					y: 26.614775058736264,
					node: 7595079339,
					travelTimeMs: 76,
					connections: [],
					heading: 5.385587406153931,
					parent: undefined,
				},
			]),
		).toMatchObject({
			top: 0,
			left: 0,
			width: 133.6931835020331,
			height: 120.8503811309258,
		}))
})
