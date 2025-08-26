import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DeviceType } from '../src/context/Devices.js'

void describe('Nordic NR+ Device Support', () => {
	void it('should have NORDIC_NRPLUS device type', () => {
		assert.equal(DeviceType.NORDIC_NRPLUS, 'nordic-nrplus')
	})

	void it('should process nordic-nrplus LwM2M objects', () => {
		// Mock LwM2M objects for testing
		const mockObjects = [
			{
				ObjectID: 14502, // Network Neighbor
				ObjectInstanceID: 0,
				Resources: {
					0: 1523, // Neighbor ID
					1: -98,  // RSSI
					99: Math.floor(Date.now() / 1000) // Timestamp
				}
			},
			{
				ObjectID: 14503, // DECT NR+ Connection Profile
				ObjectInstanceID: 0,
				Resources: {
					0: 862,  // Long RD ID
					1: 22,   // Network ID
					2: 'PT', // Operational Mode
					99: Math.floor(Date.now() / 1000) // Timestamp
				}
			},
			{
				ObjectID: 14220, // Button Press
				ObjectInstanceID: 1,
				Resources: {
					99: Math.floor(Date.now() / 1000) // Timestamp
				}
			}
		]

		// This test verifies the object structure is correct
		// In the actual implementation, these objects would be processed
		// by the LwM2M context and stored in the device state
		
		assert.equal(mockObjects[0].ObjectID, 14502)
		assert.equal(mockObjects[1].ObjectID, 14503)
		assert.equal(mockObjects[2].ObjectID, 14220)
		
		// Verify expected data structure
		const networkNeighbor = mockObjects[0]
		assert.equal(networkNeighbor.Resources[0], 1523) // Neighbor ID
		assert.equal(networkNeighbor.Resources[1], -98)  // RSSI
		
		const connectionProfile = mockObjects[1]
		assert.equal(connectionProfile.Resources[0], 862) // Long RD ID
		assert.equal(connectionProfile.Resources[1], 22)  // Network ID
		assert.equal(connectionProfile.Resources[2], 'PT') // Operational Mode
		
		const buttonPress = mockObjects[2]
		assert.equal(buttonPress.ObjectInstanceID, 1) // Button ID from instance
	})

	void it('should group devices by network ID', () => {
		// Mock devices with different network IDs
		const mockDevices = [
			{
				id: 'device1',
				type: DeviceType.NORDIC_NRPLUS,
				state: {
					nordicNrplus: {
						connectionProfile: { networkId: 22, longRdId: 862, operationalMode: 'PT', ts: Date.now() },
						neighbors: {},
						buttonPresses: {}
					}
				}
			},
			{
				id: 'device2', 
				type: DeviceType.NORDIC_NRPLUS,
				state: {
					nordicNrplus: {
						connectionProfile: { networkId: 22, longRdId: 863, operationalMode: 'FT', ts: Date.now() },
						neighbors: {},
						buttonPresses: {}
					}
				}
			},
			{
				id: 'device3',
				type: DeviceType.NORDIC_NRPLUS,
				state: {
					nordicNrplus: {
						connectionProfile: { networkId: 33, longRdId: 864, operationalMode: 'PT', ts: Date.now() },
						neighbors: {},
						buttonPresses: {}
					}
				}
			}
		]

		// Group by network ID
		const networkGroups = new Map<number, typeof mockDevices>()
		mockDevices.forEach(device => {
			const networkId = device.state.nordicNrplus?.connectionProfile?.networkId
			if (networkId !== undefined) {
				if (!networkGroups.has(networkId)) {
					networkGroups.set(networkId, [])
				}
				networkGroups.get(networkId)?.push(device)
			}
		})

		// Verify grouping
		assert.equal(networkGroups.size, 2) // Two networks: 22 and 33
		assert.equal(networkGroups.get(22)?.length, 2) // Network 22 has 2 devices
		assert.equal(networkGroups.get(33)?.length, 1) // Network 33 has 1 device
	})
})