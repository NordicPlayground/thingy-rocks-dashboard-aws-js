import { useDevices } from './context/Devices.js'

export const DeviceName = ({
	device,
	fallback,
	details,
}: {
	device: { id: string }
	fallback?: string
	// Shown below the device id in the tooltip
	details?: string
}) => {
	const { alias } = useDevices()
	const shortenedDeviceId =
		alias(device.id) ??
		device.id.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)

	const title =
		details !== undefined && details.length > 0
			? `${device.id}\n${details}`
			: device.id
	if (shortenedDeviceId === device.id) {
		if (details === undefined || details.length === 0)
			return <>{fallback ?? device.id}</>
		return <abbr title={title}>{fallback ?? device.id}</abbr>
	}
	return <abbr title={title}>{shortenedDeviceId}</abbr>
}
