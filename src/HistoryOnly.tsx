import { LineChart } from 'lucide-preact'
import type { Device } from './context/Devices'
import { Title } from './DeviceList'
import { DeviceName } from './DeviceName'

export const HistoryOnly = ({
	device,
	onClick,
}: {
	device: Device
	onClick: () => void
}) => (
	<Title type={'button'} onClick={onClick}>
		<LineChart class={'mx-1'} />
		<span class="info">
			<DeviceName device={device} />
		</span>
	</Title>
)
