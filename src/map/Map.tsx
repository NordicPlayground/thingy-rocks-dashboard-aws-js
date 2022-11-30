import styled from 'styled-components'
import { GeoLocation, useDevices } from '../context/Devices'
import { BaseMap } from './BaseMap'
import { DeviceLocation } from './DeviceLocation'

export const StyledMap = styled.div`
	position: absolute;
	height: 100vh;
	width: 100vw;
	top: 0;
	left: 0;
	z-index: -1000;
`

export const Map = () => {
	const { devices } = useDevices()

	const deviceLocations: Record<string, GeoLocation[]> = {}
	for (const [deviceId, { location }] of Object.entries(devices)) {
		if (location === undefined) continue
		deviceLocations[deviceId] = Object.values(location)
	}

	return (
		<BaseMap>
			{Object.entries(deviceLocations).map(([deviceId, locations]) =>
				locations.map((location) => (
					<DeviceLocation deviceId={deviceId} location={location} />
				)),
			)}
		</BaseMap>
	)
}
