import { FakeDevice } from './FakeDevice'

export const FakeLight = () => <FakeDevice fakeState={fakeLightState} />

import type { Reported } from '../context/Devices'

const fakeLightState = (): Reported => ({
	led: {
		v: {
			type: 'rgb',
			color: [0, 169, 206],
		},
		ts: Date.now(),
	},
	geo: {
		lng: 10.4383147713927,
		lat: 63.42503380159108,
	},
})
