import type { GeoLocation } from '../context/Devices'
import { useMap } from '../context/Map'

export const DeviceLocation = ({
	deviceId,
	location,
}: {
	deviceId: string
	location: GeoLocation
}) => {
	const map = useMap()
	map.showDeviceLocation({ deviceId, location })
	return null
}
