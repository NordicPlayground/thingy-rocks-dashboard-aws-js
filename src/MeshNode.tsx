import { Network, Server, UploadCloud } from 'lucide-preact'
import { ButtonPress } from './ButtonPress'
import { Device, MeshNodeInfo, Reported, useDevices } from './context/Devices'
import { LastUpdate, Properties, Title } from './DeviceList'
import { FiveGMesh } from './icons/5GMesh'
import { ManageDevice } from './ManageDevice'
import { RelativeTime } from './RelativeTime'

export type MeshNodeDevice = Device & {
	state: Reported & { meshNode: MeshNodeInfo }
}

export const MeshNode = ({
	device,
	onClick,
	onManaging,
}: {
	device: MeshNodeDevice
	onClick: () => void
	onManaging?: (isManaging: boolean) => void
}) => {
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const { node, hops, travelTimeMs, gateway } = device.state.meshNode
	const buttonPress = device.state?.btn
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
					<abbr title={'Gateway'}>
						<Server strokeWidth={1} />
					</abbr>
				</dt>
				<dd>{gateway}</dd>
				<dt>
					<Network strokeWidth={1} />
				</dt>
				<dd>
					{hops} {hops > 1 ? 'hops' : 'hop'},{' '}
					<abbr title="travel time">{travelTimeMs} ms</abbr>
				</dd>
				<ManageDevice
					device={device}
					led="on/off"
					onLockChange={(unlocked) => onManaging?.(unlocked)}
				/>
			</Properties>
		</>
	)
}
