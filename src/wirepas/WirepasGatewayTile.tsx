import { Hexagon, UploadCloud, Waypoints, Zap } from 'lucide-preact'
import { LastUpdate, Properties, Title } from '../DeviceList.js'
import { DeviceName } from '../DeviceName.js'
import { PinTile } from '../PinTile.js'
import { RelativeTime } from '../RelativeTime.js'
import {
	useDevices,
	WirepasMeshQOS,
	type WirepasGateway,
	type WirepasGatewayNode,
} from '../context/Devices.js'
import { useMap } from '../context/Map.js'
import { removeOldLocation } from '../removeOldLocation.js'
import { sortLocations } from '../sortLocations.js'
import { FiveGMesh } from '../icons/5GMesh.js'

export const WirepasGatewayTile = ({
	gateway,
}: {
	gateway: WirepasGateway
}) => {
	const map = useMap()
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const { location } = gateway
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]

	return (
		<>
			<Title
				type={'button'}
				onClick={() => {
					if (deviceLocation !== undefined) {
						map?.center(deviceLocation)
					}
				}}
			>
				<FiveGMesh class="icon" />
				<span class="info">
					<DeviceName device={gateway} />
				</span>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
				<PinTile device={gateway} />
			</Title>
			<Properties>
				{Object.entries(gateway.state.nodes).map(([id, node]) => (
					<Node id={id} node={node} gateway={gateway} />
				))}
			</Properties>
		</>
	)
}

const Node = ({
	id,
	node,
}: {
	id: string
	gateway: WirepasGateway
	node: WirepasGatewayNode
}) => {
	return (
		<>
			<dt>
				<Hexagon strokeWidth={1} class="ms-1 p-1" /> {id}{' '}
			</dt>
			<dd>
				<span class={'ms-1'}>
					<Waypoints strokeWidth={1} class={'me-1'} />
					{node.hops} / {node.travelTimeMs} ms
				</span>
				{node.qos === WirepasMeshQOS.High && (
					<abbr class={'ms-1'} title="QoS: high">
						<Zap strokeWidth={1} />
					</abbr>
				)}
			</dd>
		</>
	)
}
