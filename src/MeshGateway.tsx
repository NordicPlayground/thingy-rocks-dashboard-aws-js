import { ChevronDown, ChevronUp, Network, UploadCloud } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { LastUpdate, Properties, Title } from './DeviceList'
import { DeviceName } from './DeviceName'
import { MeshNode } from './MeshNode'
import { RelativeTime } from './RelativeTime'
import {
	useDevices,
	type MeshGateway as MeshGatewayDevice,
	type MeshNode as MeshNodeType,
} from './context/Devices'
import { useSettings } from './context/Settings'
import { FiveGMesh } from './icons/5GMesh'
import { NRPlus } from './icons/NRPlus'

export const MeshGateway = ({
	device,
	onClick,
}: {
	device: MeshGatewayDevice
	onClick: () => void
}) => {
	const { lastUpdateTs, alias } = useDevices()
	const lastUpdateTime = lastUpdateTs(device.id) as number
	const {
		settings: { showFavorites, favorites },
	} = useSettings()
	const [showMore, setShowMore] = useState<boolean>(false)

	// Show only favorited nodes
	const nodesToShow = device.meshNodes
		.filter((node) => {
			if (!showFavorites) return true
			return favorites.includes(node.id)
		})
		// And sort the ones which have an alias first
		.sort((a) => (alias(a.id) === undefined ? 1 : -1))

	// Show all aliased nodes, or up to 3 above the fold
	const nodesWithAlias = nodesToShow.filter(
		(node) => alias(node.id) !== undefined,
	)
	const cutoff = Math.max(nodesWithAlias.length, 3)
	const visible = nodesToShow.slice(0, cutoff)
	const more = nodesToShow.slice(cutoff)

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
				{visible.map((node) => (
					<ShowNode node={node} />
				))}
				{more.length > 0 && showMore && (
					<>
						<dt class="mt-2 opacity-75">
							<ChevronUp strokeWidth={1} />
						</dt>
						<dd class="mt-2 opacity-75">
							<button type="button" onClick={() => setShowMore((s) => !s)}>
								<em>hide {more.length} more</em>
							</button>
						</dd>
						{more.map((node) => (
							<ShowNode node={node} />
						))}
					</>
				)}
				{more.length > 0 && !showMore && (
					<>
						<dt class="mt-2 opacity-75">
							<ChevronDown strokeWidth={1} />
						</dt>
						<dd class="mt-2 opacity-75">
							<button type="button" onClick={() => setShowMore((s) => !s)}>
								<em>show {more.length} more</em>
							</button>
						</dd>
					</>
				)}
			</Properties>
		</>
	)
}

const ShowNode = ({ node }: { node: MeshNodeType }) => (
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
)
