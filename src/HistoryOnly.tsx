import { LineChart } from 'lucide-preact'
import { Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import type { Device } from './DeviceType.ts'

export const HistoryOnly = ({
	device,
	onClick,
}: {
	device: Device
	onClick: () => void
}) => (
	<Title onClick={onClick}>
		<LineChart class={'mx-1'} />
		<span class="info">
			<DeviceName device={device} />
		</span>
	</Title>
)
