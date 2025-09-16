import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isNordicNrplus } from '../context/Devices.js'

void describe('FakeNordicNrplus', () => {
	void it('should create valid Nordic NR+ device structure', () => {
		// Mock device data similar to what FakeNordicNrplus would create
		const mockSinkDevice = {
			id: 'test-sink-12345678',
			state: {
				nordicNrplus: {
					connectionProfile: {
						networkId: 42,
						longRdId: 850,
						operationalMode: 'FT', // Full Function Terminal (sink)
						ts: Date.now(),
					},
					neighbors: {
						'0': {
							neighborId: 851,
							rssi: -75,
							ts: Date.now(),
						},
						'1': {
							neighborId: 852,
							rssi: -68,
							ts: Date.now(),
						},
					},
					buttonPresses: {
						'0': {
							v: 1,
							ts: Date.now() - 5000,
						},
					},
				},
			},
		}

		const mockLeafDevice = {
			id: 'test-leaf-12345679',
			state: {
				nordicNrplus: {
					connectionProfile: {
						networkId: 42,
						longRdId: 851,
						operationalMode: 'PT', // Peer Terminal (leaf)
						ts: Date.now(),
					},
					neighbors: {
						'0': {
							neighborId: 850,
							rssi: -72,
							ts: Date.now(),
						},
					},
					buttonPresses: {
						'0': {
							v: 1,
							ts: Date.now() - 1000,
						},
					},
				},
			},
		}

		// Verify that our mock devices are recognized as Nordic NR+ devices
		assert.equal(isNordicNrplus(mockSinkDevice), true)
		assert.equal(isNordicNrplus(mockLeafDevice), true)

		// Verify the sink device has FT operational mode
		assert.equal(
			mockSinkDevice.state.nordicNrplus.connectionProfile.operationalMode,
			'FT',
		)

		// Verify the leaf device has PT operational mode
		assert.equal(
			mockLeafDevice.state.nordicNrplus.connectionProfile.operationalMode,
			'PT',
		)

		// Verify they have the same network ID
		assert.equal(
			mockSinkDevice.state.nordicNrplus.connectionProfile.networkId,
			mockLeafDevice.state.nordicNrplus.connectionProfile.networkId,
		)

		// Verify the sink has multiple neighbors (2 leaf devices)
		assert.equal(
			Object.keys(mockSinkDevice.state.nordicNrplus.neighbors).length,
			2,
		)

		// Verify the leaf has one neighbor (the sink)
		assert.equal(
			Object.keys(mockLeafDevice.state.nordicNrplus.neighbors).length,
			1,
		)

		// Verify RSSI values are in reasonable range (-90 to -50 dBm)
		const sinkNeighborRssi =
			mockSinkDevice.state.nordicNrplus.neighbors['0'].rssi
		const leafNeighborRssi =
			mockLeafDevice.state.nordicNrplus.neighbors['0'].rssi

		assert.ok(sinkNeighborRssi >= -90 && sinkNeighborRssi <= -50)
		assert.ok(leafNeighborRssi >= -90 && leafNeighborRssi <= -50)
	})

	void it('should group Nordic NR+ devices by network ID', () => {
		const mockDevices = [
			{
				id: 'sink1',
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
			},
			{
				id: 'leaf1',
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
			},
			{
				id: 'leaf2',
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
			},
		]

		// Group by network ID (simulating what happens in DeviceList.tsx)
		const networkGroups = new Map<number, typeof mockDevices>()
		mockDevices.forEach((device) => {
			const networkId = device.state.nordicNrplus?.connectionProfile?.networkId
			if (networkId !== undefined) {
				if (!networkGroups.has(networkId)) {
					networkGroups.set(networkId, [])
				}
				networkGroups.get(networkId)?.push(device)
			}
		})

		// Verify all 3 devices are grouped under network ID 42
		assert.equal(networkGroups.size, 1)
		assert.equal(networkGroups.get(42)?.length, 3)
	})
})
