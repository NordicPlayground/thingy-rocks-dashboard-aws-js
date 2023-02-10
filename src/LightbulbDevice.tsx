import { Lightbulb, UploadCloud } from 'lucide-preact'
import { Device, useDevices } from './context/Devices'
import { useSettings } from './context/Settings'
import { useWebsocket } from './context/WebsocketConnection'
import { LastUpdate, Properties, Title } from './DeviceList'
import { RelativeTime } from './RelativeTime'
import { RGBControl } from './RGBControl'

export const LightbulbDevice = ({
	device,
	onClick,
}: {
	device: Device
	onClick: () => void
}) => {
	const { lastUpdateTs, alias } = useDevices()
	const { settings } = useSettings()
	const { send } = useWebsocket()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const shortenedDeviceId =
		alias(device.id) ??
		device.id.replace(/^[\d]+\d{4}$/, (match) => `…${match.slice(-4)}`)
	const color = device.state?.led?.v?.color ?? [0, 0, 0]
	const code = settings.managementCodes[device.id]
	const unlocked = code !== undefined

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
				{unlocked && (
					<RGBControl
						color={color}
						onChange={(newColor) => {
							send({
								desired: {
									led: {
										v: {
											color: newColor,
										},
									},
								},
								deviceId: device.id,
								code,
							})
						}}
					/>
				)}
			</Properties>
		</>
	)
}
