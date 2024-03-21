import { styled } from 'styled-components'
import { ShowWhenHot } from '../ShowWhenHot.js'
import type { Device } from '../context/Devices.js'
import { Memfault } from '../icons/Memfault.js'
import { useMemfault, type Reboot } from './Context.js'

const Hot = styled.span`
	color: var(--color-nordic-pink);
`

export const Reboots = ({ device }: { device: Device }) => {
	const { reboots } = useMemfault()

	const deviceReboots = reboots[device.id] ?? []

	if (deviceReboots.length === 0) return null

	const numReboots = deviceReboots.length
	const lastReboot = deviceReboots[0] as Reboot

	return (
		<>
			<dt class={'flex align-items-start'}>
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
				<ShowWhenHot ts={new Date(lastReboot.time)} untilSeconds={120}>
					{(diffSeconds) => (
						<>
							<br />
							<Hot>most recently {diffSeconds} seconds ago</Hot>
						</>
					)}
				</ShowWhenHot>
			</dd>
		</>
	)
}
