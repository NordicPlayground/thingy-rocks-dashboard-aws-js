import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DeviceType, isNordicNrplus } from './context/Devices.js'

void describe('Device Type Checking', () => {
	void it('should correctly identify Nordic NR+ devices by type field', () => {
		// Device with proper type field and nordicNrplus state - should be identified
		const validNordicDevice = {
			id: 'test-device-1',
			type: DeviceType.NORDIC_NRPLUS,
			state: {
				nordicNrplus: {
					connectionProfile: {
						networkId: 42,
						longRdId: 850,
						operationalMode: 'FT',
						ts: Date.now(),
					},
					neighbors: {},
					buttonPresses: {},
				},
			},
		}

		// Device with nordicNrplus state but wrong type - should not be identified
		const invalidTypeDevice = {
			id: 'test-device-2',
			type: DeviceType.SOFT_SIM,
			state: {
				nordicNrplus: {
					connectionProfile: {
						networkId: 42,
						longRdId: 851,
						operationalMode: 'PT',
						ts: Date.now(),
					},
					neighbors: {},
					buttonPresses: {},
				},
			},
		}

		// Device with nordicNrplus state but no type field - should not be identified
		const noTypeDevice = {
			id: 'test-device-3',
			state: {
				nordicNrplus: {
					connectionProfile: {
						networkId: 42,
						longRdId: 852,
						operationalMode: 'PT',
						ts: Date.now(),
					},
					neighbors: {},
					buttonPresses: {},
				},
			},
		}

		// Device with correct type but no nordicNrplus state - should not be identified
		const noStateDevice = {
			id: 'test-device-4',
			type: DeviceType.NORDIC_NRPLUS,
			state: {},
		}

		// Verify type checking works correctly
		assert.equal(
			isNordicNrplus(validNordicDevice),
			true,
			'Valid Nordic device should be identified',
		)
		assert.equal(
			isNordicNrplus(invalidTypeDevice),
			false,
			'Device with wrong type should not be identified',
		)
		assert.equal(
			isNordicNrplus(noTypeDevice),
			false,
			'Device without type field should not be identified',
		)
		assert.equal(
			isNordicNrplus(noStateDevice),
			false,
			'Device without nordicNrplus state should not be identified',
		)
	})
})
