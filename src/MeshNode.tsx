import { Network, UploadCloud } from 'lucide-preact'
import { ButtonPress } from './ButtonPress'
import { Device, MeshNodeInfo, Reported, useDevices } from './context/Devices'
import { useSettings } from './context/Settings'
import { useWebsocket } from './context/WebsocketConnection'
import { LastUpdate, Properties, Title } from './DeviceList'
import { FiveGMesh } from './icons/5GMesh'
import { NRPlus } from './icons/NRPlus'
import { OnOffControl } from './OnOffControl'
import { RelativeTime } from './RelativeTime'
import type { RGB } from './rgbToHex'

export type MeshNodeDevice = Device & {
	state: Reported & { meshNode: MeshNodeInfo }
}

const isOn = (color: RGB) => (color.reduce((total, c) => c + total, 0) ?? 0) > 0

export const MeshNode = ({
	device,
	onClick,
}: {
	device: MeshNodeDevice
	onClick: () => void
}) => {
	const { send } = useWebsocket()
	const { lastUpdateTs } = useDevices()
	const { settings } = useSettings()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const { node, hops, travelTimeMs, gateway } = device.state.meshNode
	const buttonPress = device.state?.btn
	const code = settings.managementCodes[device.id]
	const unlocked = code !== undefined
	const ledIsOn = isOn(device.state?.led?.v?.color ?? [0, 0, 0])

	return (
		<>
			<Title type={'button'} onClick={onClick}>
				<FiveGMesh class="icon" alt="Wirepas 5G Mesh" />
				<span class="info">{node}</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>
			<Properties>
				{buttonPress !== undefined && (
					<ButtonPress
						key={`${node}-press-${buttonPress.ts}`}
						buttonPress={buttonPress}
					/>
				)}
				<dt>
					<NRPlus class="icon" alt="DECT NR+" />
				</dt>
				<dd>
					{hops} {hops > 1 ? 'hops' : 'hop'},{' '}
					<abbr title="travel time">{travelTimeMs} ms</abbr>
				</dd>
				<dt>
					<abbr title={'Gateway'}>
						<Network strokeWidth={1} />
					</abbr>
				</dt>
				<dd>{gateway}</dd>
				{unlocked && (
					<OnOffControl
						on={ledIsOn}
						onChange={(on) => {
							send({
								desired: {
									led: {
										v: {
											color: on ? [255, 255, 255] : [0, 0, 0],
										},
									},
								},
								deviceId: device.id,
								code: code,
							})
						}}
					/>
				)}
			</Properties>
		</>
	)
}
