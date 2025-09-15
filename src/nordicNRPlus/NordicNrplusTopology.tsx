import { useEffect, useMemo } from 'preact/hooks'
import type { GeoLocation, NordicNrplusDevice } from '../context/Devices.tsx'
import { DeviceType, useDevices } from '../context/Devices.tsx'
import { useMap } from '../context/Map.tsx'
import { removeOldLocation } from '../removeOldLocation.tsx'

type NetworkTopology = {
	networkId: number
	sinkDevice?: NordicNrplusDevice
	leafDevices: NordicNrplusDevice[]
	connections: Array<{
		connectionId: string
		from: GeoLocation
		to: GeoLocation
		sinkId: string
		leafId: string
	}>
}

const getDeviceLocation = (
	device: NordicNrplusDevice,
): GeoLocation | undefined => {
	if (!device.location) return undefined
	const locations = Object.values(device.location).filter(removeOldLocation)
	return locations[0] // Get the most recent location
}

export const NordicNrplusTopology = () => {
	const { devices } = useDevices()
	const map = useMap()

	// Get all Nordic NR+ devices
	const nordicNrplusDevices = useMemo(() => {
		return Object.values(devices).filter(
			(device): device is NordicNrplusDevice =>
				device.type === DeviceType.NORDIC_NRPLUS,
		)
	}, [devices])

	// Group devices by network and create topology data
	const networkTopologies = useMemo(() => {
		const networkMap = new Map<number, NordicNrplusDevice[]>()

		// Group devices by network ID
		nordicNrplusDevices.forEach((device) => {
			const networkId = device.state?.nordicNrplus?.connectionProfile?.networkId
			if (networkId !== undefined) {
				const existing = networkMap.get(networkId) ?? []
				networkMap.set(networkId, [...existing, device])
			}
		})

		const topologies: NetworkTopology[] = []

		// Create topology for each network
		networkMap.forEach((networkDevices, networkId) => {
			const sinkDevice = networkDevices.find(
				(device) =>
					device.state?.nordicNrplus?.connectionProfile?.operationalMode ===
					'FT',
			)
			const leafDevices = networkDevices.filter(
				(device) => device !== sinkDevice,
			)

			if (sinkDevice) {
				const sinkLocation = getDeviceLocation(sinkDevice)
				const connections: NetworkTopology['connections'] = []

				if (sinkLocation) {
					leafDevices.forEach((leafDevice) => {
						const leafLocation = getDeviceLocation(leafDevice)
						if (leafLocation) {
							connections.push({
								connectionId: `nordic-nrplus-connection-${networkId}-${sinkDevice.id}-${leafDevice.id}`,
								from: sinkLocation,
								to: leafLocation,
								sinkId: sinkDevice.id,
								leafId: leafDevice.id,
							})
						}
					})
				}

				topologies.push({
					networkId,
					sinkDevice,
					leafDevices,
					connections,
				})
			}
		})

		return topologies
	}, [nordicNrplusDevices])

	// Add topology connections to the map
	useEffect(() => {
		const activeConnectionIds: string[] = []

		// Add all current connections
		const addConnections = async () => {
			for (const { connections } of networkTopologies) {
				for (const { connectionId, from, to } of connections) {
					activeConnectionIds.push(connectionId)
					await map.showTopologyConnection({
						connectionId,
						from,
						to,
						color: '#00a8c8', // Nordic blue color
						width: 2,
						dashArray: [2, 2], // Dashed line
						opacity: 0.8,
					})
				}
			}
		}

		void addConnections()

		// Cleanup function to remove topology connections when component unmounts or dependencies change
		return () => {
			activeConnectionIds.forEach((connectionId) => {
				map.removeTopologyConnection(connectionId)
			})
		}
	}, [map, networkTopologies])

	// This component doesn't render anything visible - it only adds layers to the map
	return null
}
