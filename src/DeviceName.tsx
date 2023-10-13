import { useDevices, type Device } from './context/Devices.js'

export const DeviceName = ({
	device,
	fallback,
}: {
	device: Device
	fallback?: string
}) => {
	const { alias } = useDevices()
	const shortenedDeviceId =
		alias(device.id) ??
		device.id.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)

	if (shortenedDeviceId === device.id) return <>{fallback ?? device.id}</>
	return <abbr title={device.id}>{shortenedDeviceId}</abbr>
}
