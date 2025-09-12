import { Ulid } from 'id128'
import { useEffect, useRef } from 'preact/hooks'
import { type Reported } from '../context/Devices.js'
import { useDevices } from '../context/Devices.js'
import { useSettings } from '../context/Settings.js'

export const FakeNordicNrplus = () => {
	const { updateState } = useDevices()
	const {
		settings: { enableTestDevice },
	} = useSettings()

	// Generate stable device IDs
	const deviceIds = useRef({
		sink: `test-sink-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf1: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
		leaf2: `test-leaf-${Ulid.generate().toCanonical().slice(-8)}`,
	})

	// Generate a random network ID (between 1-255)
	const networkId = useRef(Math.floor(Math.random() * 255) + 1)

	// Generate random longRdIds
	const longRdIds = useRef({
		sink: Math.floor(Math.random() * 1000) + 800, // 800-1799
		leaf1: Math.floor(Math.random() * 1000) + 800,
		leaf2: Math.floor(Math.random() * 1000) + 800,
	})

	const generateRandomRssi = () => Math.floor(Math.random() * 40) - 90 // -90 to -50 dBm

	const createSinkState = (): Reported => ({
		dev: {
			v: {
				imei: '351358811471140',
				iccid: '89470060200703359994',
				modV: 'mfw_nrf9160_1.3.2',
				brdV: 'nrf9161dk_nrf9161',
				appV: '1.0.0-nrplus-sink',
			},
			ts: Date.now(),
		},
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
			},
			buttonPresses: {
				'0': {
					v: 1,
					ts: Date.now() - 5000,
				},
			},
		},
		env: {
			v: {
				temp: 22.5 + Math.random() * 5, // 22.5-27.5°C
				hum: 40 + Math.random() * 20, // 40-60%
				atmp: 100 + Math.random() * 2, // 100-102 kPa
			},
			ts: Date.now(),
		},
		geo: {
			lng: 10.4383147713927 + (Math.random() - 0.5) * 0.01,
			lat: 63.42503380159108 + (Math.random() - 0.5) * 0.01,
		},
	})

	const createLeafState = (leafIndex: 1 | 2): Reported => ({
		dev: {
			v: {
				imei: `35135881147${leafIndex}${leafIndex}${leafIndex}${leafIndex}`,
				iccid: `8947006020070335999${leafIndex}`,
				modV: 'mfw_nrf9160_1.3.2',
				brdV: 'nrf9161dk_nrf9161',
				appV: '1.0.0-nrplus-leaf',
			},
			ts: Date.now(),
		},
		nordicNrplus: {
			connectionProfile: {
				networkId: networkId.current,
				longRdId: longRdIds.current[leafIndex === 1 ? 'leaf1' : 'leaf2'],
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
		env: {
			v: {
				temp: 20 + Math.random() * 8, // 20-28°C
				hum: 35 + Math.random() * 30, // 35-65%
				atmp: 99.5 + Math.random() * 3, // 99.5-102.5 kPa
			},
			ts: Date.now(),
		},
		geo: {
			lng: 10.4383147713927 + (Math.random() - 0.5) * 0.02 + leafIndex * 0.01,
			lat: 63.42503380159108 + (Math.random() - 0.5) * 0.02 + leafIndex * 0.01,
		},
	})

	const updateDevices = () => {
		updateState(deviceIds.current.sink, createSinkState())
		updateState(deviceIds.current.leaf1, createLeafState(1))
		updateState(deviceIds.current.leaf2, createLeafState(2))
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