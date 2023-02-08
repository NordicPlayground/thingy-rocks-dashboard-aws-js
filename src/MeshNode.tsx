import { Network, Server, UploadCloud } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPress } from './ButtonPress'
import { Device, MeshNodeInfo, Reported, useDevices } from './context/Devices'
import { LastUpdate, Title } from './DeviceList'
import { FiveGMesh } from './icons/5GMesh'
import { RelativeTime } from './RelativeTime'

export type MeshNodeDevice = Device & {
	state: Reported & { meshNode: MeshNodeInfo }
}

const Properties = styled.dl`
	margin: 0;
	display: grid;
	grid-template-columns: auto auto;
	grid-template-rows: 1fr;
	grid-auto-rows: auto;
	grid-column-gap: 0px;
	grid-row-gap: 0px;
	font-size: 85%;
	dd {
		margin-bottom: 0;
		white-space: nowrap;
	}
	dt {
		display: flex;
		align-items: center;
		margin-right: 0.5rem;
		.lucide {
			margin-right: 4px;
			margin-left: 4px;
		}
	}
`

export const MeshNode = ({
	device,
	onClick,
}: {
	device: MeshNodeDevice
	onClick: () => void
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
			</Properties>
		</>
	)
}
