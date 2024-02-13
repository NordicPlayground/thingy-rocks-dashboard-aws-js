import { useEffect } from 'preact/hooks'
import {
	useDevices,
	type Device,
	type Location,
	type GeoLocation,
} from '../context/Devices.js'
import { useMap } from '../context/Map.js'
import { useVisibleDevices } from '../context/VisibleDevices.js'

type DeviceLocation = {
	location: Location
	alias?: string
	id: string
}

export const DeviceLocations = () => {
	const { alias } = useDevices()
	const visibleDevices = useVisibleDevices()

	const deviceLocations: DeviceLocation[] = visibleDevices
		.filter(
			(device): device is Device & { location: Location } =>
				device.location !== undefined,
		)
		.map((device) => ({
			location: device.location,
			alias: alias(device.id),
			id: device.id,
		}))

	return (
		<>
			{deviceLocations.map((deviceLocation) =>
				Object.values(deviceLocation.location).map((l) => (
					<DeviceLocation
						id={deviceLocation.id}
						alias={deviceLocation.alias}
						location={l}
						key={locationKey(deviceLocation.id, l)}
					/>
				)),
			)}
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
