import { Lightbulb, UploadCloud } from 'lucide-preact'
import { Device, useDevices } from './context/Devices'
import { LastUpdate, Properties, Title } from './DeviceList'
import { ManageDevice } from './ManageDevice'
import { RelativeTime } from './RelativeTime'

export const LightbulbDevice = ({
	device,
	onClick,
}: {
	device: Device
	onClick: () => void
}) => {
	const { lastUpdateTs, alias } = useDevices()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const shortenedDeviceId =
		alias(device.id) ??
		device.id.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)
	const color = device.state?.led?.v?.color ?? [0, 0, 0]
	return (
		<>
			<Title type={'button'} onClick={onClick}>
				<Lightbulb
					class={'mx-1'}
					color={`rgb(${color[0]},${color[1]},${color[2]})`}
				/>
				<span class="info">
					{shortenedDeviceId !== device.id && (
						<abbr title={device.id}>{shortenedDeviceId}</abbr>
					)}
					{shortenedDeviceId === device.id && <>{device.id}</>}
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>
			<Properties>
				<ManageDevice device={device} led="rgb" />
			</Properties>
		</>
	)
}
