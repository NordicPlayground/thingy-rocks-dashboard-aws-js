import { Ulid } from 'id128'
import { useEffect, useRef } from 'preact/hooks'
import { useDevices } from '../context/Devices.js'
import { useSettings } from '../context/Settings.js'
import {
	DeviceType,
	GeoLocationSource,
	type Reading,
	type Reported,
	type Summary,
} from '../DeviceType.ts'

export const FakeNordicNrplus = () => {
	const { updateState, updateLocation, updateType, updateHistory } =
		useDevices()
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

	// What a device reports for each LED mode
	const ledEffects = [
		{ red: 0, green: 0, blue: 0, mode: 'off', period: 0 },
		{ red: 255, green: 179, blue: 0, mode: 'steady', period: 0 },
		{ red: 198, green: 0, blue: 126, mode: 'blink', period: 1000 },
		{ red: 61, green: 220, blue: 132, mode: 'breathe', period: 3000 },
		{ red: 0, green: 168, blue: 200, mode: 'pulse', period: 2000 },
		{ red: 0, green: 0, blue: 0, mode: 'random_breathe', period: 3000 },
		{ red: 0, green: 0, blue: 0, mode: 'rainbow', period: 4000 },
		{ red: 255, green: 70, blue: 0, mode: 'fire', period: 0 },
	]

	const generateRandomRssi = () => Math.floor(Math.random() * 40) - 90 // -90 to -50 dBm

	const createSinkState = (): Reported => ({
		nordicNrplus: {
			connectionProfile: {
				networkId: networkId.current,
				longRdId: longRdIds.current.sink,
				operationalMode: 'FT', // Full Function Terminal (sink)
				globalIpv6: '2001:db8:0:1::',
				linkLocalIpv6: 'fe80::',
				band: 1,
				channel: 1657,
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
		env: {
			v: { temp: 18 + leafIndex + Math.random() },
			ts: Date.now(),
		},
		fg: {
			v: { SoC: 95 - leafIndex * 12 },
			ts: Date.now(),
		},
		led: createLedState(leafIndex),
		nordicNrplus: {
			connectionProfile: {
				networkId: networkId.current,
				longRdId: longRdIds.current[`leaf${leafIndex}`],
				operationalMode: 'PT', // Peer Terminal (leaf)
				globalIpv6: `2001:db8:0:1::${leafIndex}`,
				linkLocalIpv6: `fe80::${leafIndex}`,
				ts: Date.now(),
			},
			neighbors: {
				'0': {
					neighborId: longRdIds.current.sink,
					rssi: generateRandomRssi(),
					snr: Math.floor(Math.random() * 20),
					rxMcs: 4,
					txPower: 0,
					neighborTxPower: 0,
					txAttempts: 200,
					harqNack: Math.floor(Math.random() * 20),
					missedBeacons: 0,
					lastSeen: Math.floor(Math.random() * 10),
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

	// One reading per minute for the last hour, like the backend history summary
	const fakeReadings = (
		start: number,
		spread: number,
		min: number,
		max: number,
	): Array<Reading> =>
		Array.from({ length: 60 }, (_, minute) => [
			Math.min(
				max,
				Math.max(
					min,
					Math.round(
						start +
							Math.sin(minute / 7) * spread +
							(Math.random() - 0.5) * spread * 0.5,
					),
				),
			),
			minute * 60,
		])

	const createLeafHistory = (leafIndex: number): Summary => ({
		base: new Date(),
		rssi: fakeReadings(-60 - leafIndex * 4, 8, -110, -40),
		snr: fakeReadings(18 - leafIndex * 2, 5, 0, 40),
		temp: fakeReadings(19 + leafIndex, 1, -20, 60),
		hum: fakeReadings(40 + leafIndex * 3, 4, 0, 100),
		hPa: fakeReadings(1013, 3, 900, 1100),
		fgSoC: fakeReadings(95 - leafIndex * 12, 1, 0, 100),
	})

	const ledStep = useRef(0)

	// Cycles through the modes, so that all of them can be seen
	const createLedState = (leafIndex: number): NonNullable<Reported['led']> => ({
		v: ledEffects[(leafIndex + ledStep.current) % ledEffects.length]!,
		ts: Date.now(),
	})

	const updateDevices = () => {
		updateState(deviceIds.current.sink, createSinkState())
		updateType(deviceIds.current.sink, DeviceType.NORDIC_NRPLUS)
		updateState(deviceIds.current.leaf1, createLeafState(1))
		updateType(deviceIds.current.leaf1, DeviceType.NORDIC_NRPLUS)
		for (const leafIndex of [1, 2, 3, 4, 5] as const) {
			updateHistory(
				deviceIds.current[`leaf${leafIndex}`],
				createLeafHistory(leafIndex),
			)
		}
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
		const ledInterval = setInterval(() => {
			ledStep.current += 1
			for (const leafIndex of [1, 2, 3, 4, 5] as const) {
				updateState(deviceIds.current[`leaf${leafIndex}`], {
					led: createLedState(leafIndex),
				})
			}
		}, 8 * 1000)

		return () => {
			console.log(`[Test NR+ Network]`, 'disabled', deviceIds.current)
			clearInterval(interval)
			clearInterval(ledInterval)
		}
	}, [enableTestDevice])

	return null
}
