import { useEffect } from 'preact/hooks'
import {
	useDevices,
	type Device,
	type Location,
	type GeoLocation,
} from '../context/Devices.js'
import { useMap } from '../context/Map.js'
import { useVisibleDevices } from '../context/VisibleDevices.js'
import { removeOldLocation } from '../removeOldLocation.js'

type DeviceLocation = {
	deviceId: string
	deviceAlias?: string
	location: GeoLocation
}

export const DeviceLocations = () => {
	const { alias } = useDevices()
	const visibleDevices = useVisibleDevices()

	const deviceLocations: DeviceLocation[] = visibleDevices
		.filter(
			(device): device is Device & { location: Location } =>
				device.location !== undefined,
		)
		.map((device) =>
			Object.values(device.location)
				.filter(removeOldLocation)
				.map((l) => ({
					deviceId: device.id,
					deviceAlias: alias(device.id),
					location: l,
				})),
		)
		.flat()

	return (
		<>
			{deviceLocations.map((l) => (
				<DeviceLocation
					id={l.deviceId}
					alias={l.deviceAlias}
					location={l.location}
					key={locationKey(l.deviceId, l.location)}
				/>
			))}
		</>
	)
}

const locationKey = (deviceId: string, l: GeoLocation): string =>
	[
		deviceId,
		l.source,
		l.lat.toFixed(5),
		l.lng.toFixed(5),
		l.accuracy?.toFixed(5) ?? '-',
		l.source,
	].join('-')

const DeviceLocation = ({
	location: l,
	id,
	alias,
}: {
	id: string
	alias?: string
	location: GeoLocation
}) => {
	const map = useMap()

	useEffect(() => {
		map.showDeviceLocation({
			deviceId: id,
			deviceAlias: alias ?? id,
			location: l,
		})

		return () => {
			map.removeDeviceLocation({
				deviceId: id,
				location: l,
			})
		}
	}, [map])

	return null
}
