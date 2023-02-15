import { Network, UploadCloud } from 'lucide-preact'
import { MeshGateway as MeshGatewayDevice, useDevices } from './context/Devices'
import { LastUpdate, Properties, Title } from './DeviceList'
import { DeviceName } from './DeviceName'
import { FiveGMesh } from './icons/5GMesh'
import { NRPlus } from './icons/NRPlus'
import { MeshNode } from './MeshNode'
import { RelativeTime } from './RelativeTime'

export const MeshGateway = ({
	device,
	onClick,
}: {
	device: MeshGatewayDevice
	onClick: () => void
}) => {
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(device.id) as number

	return (
		<>
			<Title type={'button'} onClick={onClick}>
				<FiveGMesh class="icon" alt="Wirepas 5G Mesh" />
				<span class="info">
					<DeviceName device={device} />
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>
			<Properties>
				<dt class="d-flex align-items-start">
					<NRPlus class="icon" alt="DECT NR+" />
				</dt>
				<dd>5G Mesh Gateway</dd>
				{device.meshNodes.map((node) => (
					<>
						<dt class="d-flex align-items-start mt-2">
							<abbr title={'Mesh Node'}>
								<Network strokeWidth={1} />
							</abbr>
						</dt>
						<dd class="mt-2">
							<MeshNode device={node} />
						</dd>
					</>
				))}
			</Properties>
		</>
	)
}
