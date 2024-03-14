import type { Device } from '../context/Devices.js'
import { Memfault } from '../icons/Memfault.js'
import { useMemfault } from './Context.js'

export const Reboots = ({ device }: { device: Device }) => {
	const { reboots } = useMemfault()

	const deviceReboots = reboots[device.id] ?? []

	if (deviceReboots.length === 0) return null

	const numReboots = deviceReboots.length

	return (
		<>
			<dt>
				<Memfault
					style={{ width: '24px', height: '24px', marginLeft: '4px' }}
				/>
			</dt>
			<dd>
				<a
					href={`https://app.memfault.com/organizations/nordic-semiconductor-asafbpk/projects/thingy-world/devices/${device.id}`}
					target={'_blank'}
					style={{ color: '#39c0ce', textDecoration: 'none' }}
				>
					{numReboots} reboot{numReboots > 1 ? 's' : ''} in the last 24 hours
				</a>
			</dd>
		</>
	)
}
