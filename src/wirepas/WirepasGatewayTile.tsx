import {
	Check,
	Focus,
	KeyRound,
	Lightbulb,
	LightbulbOff,
	Lock,
	Minus,
	Plus,
	Thermometer,
	UnlockIcon,
	UploadCloud,
	Waypoints,
	X,
	Zap,
} from 'lucide-preact'
import { LastUpdate, Title } from '../DeviceList.js'
import { DeviceName } from '../DeviceName.js'
import { PinTile } from '../PinTile.js'
import { RelativeTime } from '../RelativeTime.js'
import {
	useDevices,
	WirepasMeshQOS,
	type WirepasGateway,
	type WirepasGatewayNode,
	type GeoLocation,
} from '../context/Devices.js'
import { removeOldLocation } from '../removeOldLocation.js'
import { sortLocations } from '../sortLocations.js'
import { FiveGMesh } from '../icons/5GMesh.js'
import { useState } from 'preact/hooks'
import { ConfigureCode } from '../ConfigureCode.js'
import { useSettings } from '../context/Settings.js'
import { useWebsocket } from '../context/WebsocketConnection.js'
import { ButtonPressDiff } from '../ButtonPress.js'
import { sum } from 'lodash-es'
import { formatId } from './formatId.js'
import { cancelEvent } from '../cancelEvent.js'
import { useHistoryChart } from '../context/showHistoryChart.js'
import { useWirepasTopology } from '../context/showWirepasTopology.js'

export const WirepasGatewayTile = ({
	gateway,
	onCenter,
}: {
	gateway: WirepasGateway
	onCenter: (location: GeoLocation) => void
}) => {
	const {
		settings: { managementCodes },
	} = useSettings()
	const [configureCode, setConfigureCode] = useState<boolean>(false)
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const { location } = gateway
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]
	const code = managementCodes[gateway.id]
	const hasCode = code !== undefined
	const { hide: hideHistoryChart } = useHistoryChart()
	const { show: showTopology } = useWirepasTopology()
	const [expandNodes, setExpandNodes] = useState<boolean>(false)

	const nodes = Object.entries(gateway.state.nodes)
	const nodesSlice = nodes.slice(0, expandNodes ? undefined : 5)

	return (
		<>
			<Title
				type={'button'}
				onClick={cancelEvent(() => {
					if (deviceLocation !== undefined) {
						onCenter(deviceLocation)
					}
					hideHistoryChart()
					showTopology(gateway.id)
				})}
			>
				<FiveGMesh class="icon" />
				<span class="info">
					<DeviceName device={gateway} />
				</span>
				<button
					type="button"
					onClick={cancelEvent(() => setConfigureCode((c) => !c))}
				>
					{hasCode ? (
						<UnlockIcon
							strokeWidth={2}
							class="ms-2 p-1"
							style={{ color: '00ff00' }}
						/>
					) : (
						<Lock strokeWidth={1} class="ms-2 p-1" />
					)}
				</button>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
				<PinTile device={gateway} />
			</Title>
			<table>
				{configureCode && (
					<tr>
						<td>
							<KeyRound strokeWidth={1} class="mx-2" />
						</td>
						<td colspan={5}>
							<ConfigureCode
								device={gateway}
								onCode={() => {
									setConfigureCode(false)
								}}
							/>
						</td>
					</tr>
				)}
				{nodesSlice.map(([id, node]) => (
					<Node id={id} node={node} gateway={gateway} />
				))}
				{nodes.length > 5 &&
					(expandNodes ? (
						<tr>
							<td colSpan={6}>
								<button
									class="btn"
									type="button"
									onClick={() => setExpandNodes(false)}
								>
									<small>
										<Minus strokeWidth={1} class={'mx-1'} /> collapse
									</small>
								</button>
							</td>
						</tr>
					) : (
						<tr>
							<td colSpan={5}>
								<button
									class="btn"
									type="button"
									onClick={() => setExpandNodes(true)}
								>
									<small>
										<Plus strokeWidth={1} class={'mx-1'} /> show{' '}
										{nodes.length - nodesSlice.length} more
									</small>
								</button>
							</td>
						</tr>
					))}
			</table>
		</>
	)
}

const Node = ({
	id,
	node,
	gateway,
}: {
	id: string
	gateway: WirepasGateway
	node: WirepasGatewayNode
}) => {
	const { r, g, b } = {
		r: false,
		g: false,
		b: false,
		...(node.payload?.led ?? {}),
	}
	const color = [r ? 255 : 0, g ? 255 : 0, b ? 255 : 0]
	const noColor = sum(color) === 0
	const {
		settings: { managementCodes },
	} = useSettings()
	const { send } = useWebsocket()
	const code = managementCodes[gateway.id]
	const hasCode = code !== undefined
	const [configureLED, setConfigureLED] = useState<boolean>(false)
	const [ledState, setLEDState] = useState<{
		r: boolean
		g: boolean
		b: boolean
	}>({
		r,
		g,
		b,
	})
	return (
		<>
			<tr style={{ fontSize: '80%' }}>
				<td>
					{hasCode ? (
						<button
							type="button"
							class="btn btn-link"
							style={{
								color: noColor ? 'gray' : `rgb(${color.join(',')})`,
							}}
							onClick={() => setConfigureLED((c) => !c)}
						>
							<Lightbulb strokeWidth={noColor ? 1 : 2} class="mx-1" />
						</button>
					) : (
						<span
							style={{ color: noColor ? 'gray' : `rgb(${color.join(',')})` }}
						>
							<Lightbulb strokeWidth={noColor ? 1 : 2} class="mx-1" />
						</span>
					)}
				</td>
				<td>
					{node.qos === WirepasMeshQOS.High && (
						<abbr title="QoS: high">
							<Zap strokeWidth={1} />
						</abbr>
					)}
				</td>
				<td>{formatId(id)}</td>
				<td>
					<span class={'ms-1'}>
						<Waypoints strokeWidth={1} class={'me-1'} />
						{node.hops} <small>({node.lat} ms)</small>
					</span>
				</td>
				<td>
					{node.payload?.temp !== undefined && (
						<span>
							<Thermometer strokeWidth={1} class={'me-1'} />
							{node.payload.temp.toFixed(1)} °C
						</span>
					)}
				</td>
			</tr>
			{configureLED && (
				<tr>
					<td colspan={5}>
						<button
							type="button"
							class="btn btn-link"
							style={{ color: 'red' }}
							onClick={() => setLEDState((s) => ({ ...s, r: !s.r }))}
						>
							{ledState.r ? (
								<Lightbulb strokeWidth={2} />
							) : (
								<LightbulbOff strokeWidth={1} />
							)}
						</button>
						<button
							type="button"
							class="btn btn-link"
							style={{ color: '#18d718' }}
							onClick={() => setLEDState((s) => ({ ...s, g: !s.g }))}
						>
							{ledState.g ? (
								<Lightbulb strokeWidth={2} />
							) : (
								<LightbulbOff strokeWidth={1} />
							)}
						</button>
						<button
							type="button"
							class="btn btn-link"
							style={{ color: '#1c8afb' }}
							onClick={() => setLEDState((s) => ({ ...s, b: !s.b }))}
						>
							{ledState.b ? (
								<Lightbulb strokeWidth={2} />
							) : (
								<LightbulbOff strokeWidth={1} />
							)}
						</button>
						<button
							type="button"
							class="btn btn-link"
							onClick={() => {
								setConfigureLED(false)
								send({
									deviceId: gateway.id,
									code,
									wirepasCtrl: {
										nodes: {
											[id]: {
												payload: {
													led: ledState,
												},
											},
										},
									},
								})
							}}
						>
							<Check strokeWidth={1} />
						</button>
						<button
							type="button"
							class="btn btn-link"
							onClick={() => setConfigureLED(false)}
						>
							<X strokeWidth={1} />
						</button>
					</td>
				</tr>
			)}
			{node.payload?.btn !== undefined && (
				<ButtonPressDiff buttonPress={node.payload.btn}>
					{(diffSeconds) => (
						<tr style={{ color: 'var(--color-nordic-pink)' }}>
							<td>
								<Focus strokeWidth={2} class="mx-1" />
							</td>
							<td colspan={4}>{diffSeconds} seconds ago</td>
						</tr>
					)}
				</ButtonPressDiff>
			)}
		</>
	)
}
