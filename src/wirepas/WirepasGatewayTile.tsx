import {
	Check,
	Focus,
	Hexagon,
	Lightbulb,
	LightbulbOff,
	Lock,
	Thermometer,
	UnlockIcon,
	UploadCloud,
	Waypoints,
	X,
	Zap,
} from 'lucide-preact'
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
import { useState } from 'preact/hooks'
import { ConfigureCode } from '../ConfigureCode.js'
import { useSettings } from '../context/Settings.js'
import { useWebsocket } from '../context/WebsocketConnection.js'
import { ButtonPressDiff } from '../ButtonPress.js'
import type { ButtonPress as ButtonPressData } from '../context/Devices.js'

export const WirepasGatewayTile = ({
	gateway,
}: {
	gateway: WirepasGateway
}) => {
	const {
		settings: { managementCodes },
	} = useSettings()
	const [configureCode, setConfigureCode] = useState<boolean>(false)
	const map = useMap()
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const { location } = gateway
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]
	const code = managementCodes[gateway.id]
	const hasCode = code !== undefined

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
				<button type="button" onClick={() => setConfigureCode((c) => !c)}>
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
			<Properties>
				{configureCode && (
					<ConfigureCode
						device={gateway}
						onCode={() => {
							setConfigureCode(false)
						}}
					/>
				)}
				{Object.entries(gateway.state.nodes).map(([id, node]) => (
					<Node id={id} node={node} gateway={gateway} />
				))}
			</Properties>
		</>
	)
}

export const ButtonPress = (props: {
	buttonPress: ButtonPressData
	untilSeconds?: number
}) => {
	return (
		<ButtonPressDiff {...props}>
			{(diffSeconds) => (
				<span style={{ color: 'var(--color-nordic-pink)' }}>
					<Focus strokeWidth={2} class="me-2" />
					{diffSeconds} seconds ago
				</span>
			)}
		</ButtonPressDiff>
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
	const color = [r ? 255 : 128, g ? 255 : 128, b ? 255 : 128]
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
			<dt>
				<Hexagon strokeWidth={1} class="ms-1 p-1" /> {id}{' '}
			</dt>
			<dd>
				{hasCode ? (
					<button
						type="button"
						class="btn btn-link"
						style={{ color: `rgb(${color.join(',')})` }}
						onClick={() => setConfigureLED((c) => !c)}
					>
						<Lightbulb strokeWidth={1} />
					</button>
				) : (
					<span style={{ color: `rgb(${color.join(',')})` }}>
						<Lightbulb strokeWidth={1} />
					</span>
				)}
				<span class={'ms-1'}>
					<Waypoints strokeWidth={1} class={'me-1'} />
					{node.hops} <small>({node.lat} ms)</small>
				</span>
				{node.qos === WirepasMeshQOS.High && (
					<abbr class={'ms-1'} title="QoS: high">
						<Zap strokeWidth={1} />
					</abbr>
				)}
				{node.payload?.temp !== undefined && (
					<>
						<Thermometer strokeWidth={1} class={'me-1'} />
						{node.payload.temp.toFixed(1)} °C
					</>
				)}
				<br />
				{node.payload?.btn !== undefined && (
					<ButtonPress buttonPress={node.payload.btn} />
				)}
				{configureLED && (
					<>
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
					</>
				)}
			</dd>
		</>
	)
}
