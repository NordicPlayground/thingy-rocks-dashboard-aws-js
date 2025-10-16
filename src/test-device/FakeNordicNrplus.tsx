import { Ulid } from 'id128'
import { useEffect, useRef } from 'preact/hooks'
import {
	DeviceType,
	GeoLocationSource,
	useDevices,
	type Reported,
} from '../context/Devices.js'
import { useSettings } from '../context/Settings.js'

export const FakeNordicNrplus = () => {
	const { updateState, updateLocation, updateType } = useDevices()
	const {
		settings: { enableTestDevice },
	} = useSettings()

	// Generate stable device IDs
	const deviceIds = useRef({
		sink: `test-sink-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf1: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf2: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf3: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf4: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf5: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
	})

	// Generate a random network ID (between 1-255)
	const networkId = useRef(Math.floor(Math.random() * 255) + 1)

	// Generate random longRdIds
	const longRdIds = useRef({
		sink: Math.floor(Math.random() * 1000) + 800, // 800-1799
		leaf1: Math.floor(Math.random() * 1000) + 800,
		leaf2: Math.floor(Math.random() * 1000) + 800,
		leaf3: Math.floor(Math.random() * 1000) + 800,
		leaf4: Math.floor(Math.random() * 1000) + 800,
		leaf5: Math.floor(Math.random() * 1000) + 800,
	})

	const generateRandomRssi = () => Math.floor(Math.random() * 40) - 90 // -90 to -50 dBm

	const createSinkState = (): Reported => ({
		nordicNrplus: {
			connectionProfile: {
				networkId: networkId.current,
				longRdId: longRdIds.current.sink,
				operationalMode: 'FT', // Full Function Terminal (sink)
				ts: Date.now(),
			},
			neighbors: {
				'0': {
					neighborId: longRdIds.current.leaf1,
					rssi: generateRandomRssi(),
					ts: Date.now(),
				},
				'1': {
					neighborId: longRdIds.current.leaf2,
					rssi: generateRandomRssi(),
					ts: Date.now(),
				},
				'2': {
					neighborId: longRdIds.current.leaf3,
					rssi: generateRandomRssi(),
					ts: Date.now(),
				},
				'3': {
					neighborId: longRdIds.current.leaf4,
					rssi: generateRandomRssi(),
					ts: Date.now(),
				},
				'4': {
					neighborId: longRdIds.current.leaf5,
					rssi: generateRandomRssi(),
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
	})

	const createLeafState = (leafIndex: 1 | 2 | 3 | 4 | 5): Reported => ({
		nordicNrplus: {
			connectionProfile: {
				networkId: networkId.current,
				longRdId: longRdIds.current[`leaf${leafIndex}`],
				operationalMode: 'PT', // Peer Terminal (leaf)
				ts: Date.now(),
			},
			neighbors: {
				'0': {
					neighborId: longRdIds.current.sink,
					rssi: generateRandomRssi(),
					ts: Date.now(),
				},
			},
			buttonPresses: {
				'0': {
					v: leafIndex,
					ts: Date.now() - leafIndex * 1000,
				},
			},
		},
	})

	const updateDevices = () => {
		updateState(deviceIds.current.sink, createSinkState())
		updateType(deviceIds.current.sink, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf1, createLeafState(1))
		updateType(deviceIds.current.leaf1, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf2, createLeafState(2))
		updateType(deviceIds.current.leaf2, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf3, createLeafState(3))
		updateType(deviceIds.current.leaf3, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf4, createLeafState(4))
		updateType(deviceIds.current.leaf4, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf5, createLeafState(5))
		updateType(deviceIds.current.leaf5, DeviceType.NORDIC_NRPLUS)

		// Center coordinates (Trondheim area)
		const centerLat = 63.42503380159108
		const centerLng = 10.4383147713927
		const radius = 0.005 // About 500 meters

		// Sink in the center
		updateLocation(
			deviceIds.current.sink,
			{
				lat: centerLat,
				lng: centerLng,
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)

		// Leaf devices in a circle around the sink
		// Leaf 1 - North (0°)
		updateLocation(
			deviceIds.current.leaf1,
			{
				lat: centerLat + radius,
				lng: centerLng,
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)

		// Leaf 2 - Northeast (72°)
		updateLocation(
			deviceIds.current.leaf2,
			{
				lat: centerLat + radius * Math.cos((72 * Math.PI) / 180),
				lng: centerLng + radius * Math.sin((72 * Math.PI) / 180),
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)

		// Leaf 3 - Southeast (144°)
		updateLocation(
			deviceIds.current.leaf3,
			{
				lat: centerLat + radius * Math.cos((144 * Math.PI) / 180),
				lng: centerLng + radius * Math.sin((144 * Math.PI) / 180),
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)

		// Leaf 4 - Southwest (216°)
		updateLocation(
			deviceIds.current.leaf4,
			{
				lat: centerLat + radius * Math.cos((216 * Math.PI) / 180),
				lng: centerLng + radius * Math.sin((216 * Math.PI) / 180),
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)

		// Leaf 5 - Northwest (288°)
		updateLocation(
			deviceIds.current.leaf5,
			{
				lat: centerLat + radius * Math.cos((288 * Math.PI) / 180),
				lng: centerLng + radius * Math.sin((288 * Math.PI) / 180),
				accuracy: 10,
				source: GeoLocationSource.WIFI,
				ts: new Date(),
			},
			'test-device',
		)
	}

	useEffect(() => {
		if (!enableTestDevice) return

		console.log(
			`[Test NR+ Network]`,
			'enabled',
			`Network ID: ${networkId.current}`,
			deviceIds.current,
		)

		updateDevices()
		const interval = setInterval(() => {
			updateDevices()
		}, 60 * 1000)

		return () => {
			console.log(`[Test NR+ Network]`, 'disabled', deviceIds.current)
			clearInterval(interval)
		}
	}, [enableTestDevice])

	return null
}
