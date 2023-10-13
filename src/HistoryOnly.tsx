import { LineChart } from 'lucide-preact'
import type { Device } from './context/Devices.js'
import { Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'

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
