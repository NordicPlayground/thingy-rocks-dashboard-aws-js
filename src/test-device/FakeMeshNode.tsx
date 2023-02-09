import { FakeDevice } from './FakeDevice'

export const FakeMeshNode = () => <FakeDevice fakeState={fakeMeshNodeState} />

import type { Reported } from '../context/Devices'

const fakeMeshNodeState = (): Reported => ({
	geo: {
		lng: 10.4383147713927,
		lat: 63.42503380159108,
	},
	meshNode: {
		node: 1078800338,
		gateway: 'demo5Gmesh_gw01',
		rxTime: '2023-02-09T10:45:00.504Z',
		travelTimeMs: 15,
		hops: 1,
	},
})
