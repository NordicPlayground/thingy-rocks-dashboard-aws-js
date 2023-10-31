import {
	useDevices,
	type NRPlusGateway,
	type NRPlusNode,
} from './context/Devices.js'
import { DeviceName } from './DeviceName.js'
import { LastUpdate, Properties, Title } from './DeviceList.js'
import { NRPlus } from './icons/NRPlus.js'
import {
	Check,
	Hexagon,
	KeyRound,
	Lightbulb,
	LightbulbOff,
	Lock,
	RouterIcon,
	Thermometer,
	UploadCloud,
	X,
} from 'lucide-preact'
import { RelativeTime } from './RelativeTime.js'
import { ButtonPress } from './ButtonPress.js'
import { useState } from 'preact/hooks'
import { useWebsocket } from './context/WebsocketConnection.js'
import { useMap } from './context/Map.js'
import { sortLocations } from './sortLocations.js'

export const NRPlusGatewayTile = ({ gateway }: { gateway: NRPlusGateway }) => {
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const [configureCode, setConfigureCode] = useState<boolean>(false)
	const key = `${gateway.id}:code`
	const [deviceCode, setDeviceCode] = useState<string>(
		localStorage.getItem(key) ?? '',
	)
	const map = useMap()
	const { location } = gateway
	const rankedLocations = Object.values(location ?? []).sort(sortLocations)
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
				<NRPlus class="icon" />
				<span class="info">
					<DeviceName device={gateway} />
				</span>
				<button type="button" onClick={() => setConfigureCode((c) => !c)}>
					<Lock strokeWidth={1} class="ms-2 p-1" />
				</button>
				{lastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={new Date(lastUpdateTime)} />
					</LastUpdate>
				)}
			</Title>
			<Properties>
				{configureCode && (
					<>
						<dt>
							<KeyRound strokeWidth={1} class="ms-2 p-1" />
						</dt>
						<dd class="d-flex my-2">
							<input
								type="password"
								autoComplete="off"
								class="form-control form-control-sm me-2"
								value={deviceCode}
								onInput={(e) =>
									setDeviceCode((e.target as HTMLInputElement).value)
								}
							/>
							<button
								type="button"
								onClick={() => {
									localStorage.setItem(key, deviceCode)
									setConfigureCode(false)
								}}
							>
								<Check strokeWidth={1} />
							</button>
							<button type="button" onClick={() => setConfigureCode(false)}>
								<X strokeWidth={1} />
							</button>
						</dd>
					</>
				)}
				{Object.entries(gateway.state.nodes).map(([id, node]) => (
					<Node
						id={id}
						node={node}
						gateway={gateway}
						hasCode={deviceCode.length > 0}
					/>
				))}
			</Properties>
		</>
	)
}

const Node = ({
	id,
	node,
	gateway,
	hasCode,
}: {
	id: string
	gateway: NRPlusGateway
	node: NRPlusNode
	hasCode: boolean
}) => {
	const [configure, setConfigure] = useState<boolean>(false)
	const { send } = useWebsocket()
	const [relay, setRelay] = useState<Record<string, boolean>>({})

	const viaRelay = (useRelay: boolean) => (payload: string) => {
		const command = `dect beacon_rach_tx -t ${id} -d "${payload}"`
		if (useRelay)
			return `dect client_rach_tx --b_name relay_node -d ${JSON.stringify(
				command,
			)}`
		return command
	}

	const temp = node.env?.temp ?? node.env?.modemTemp

	return (
		<>
			<dt>
				<Hexagon strokeWidth={1} class="ms-2 p-1" /> {id}
			</dt>
			<dd>
				{hasCode && !configure && (
					<span class="p-1">
						<button
							type="button"
							class="me-2"
							onClick={() => setConfigure(true)}
						>
							<Lightbulb strokeWidth={1} />
						</button>
						{temp !== undefined && (
							<span>
								<Thermometer strokeWidth={1} /> {temp.toFixed(1)} °C
							</span>
						)}
					</span>
				)}
				{configure && (
					<span class="p-1">
						<button type="button me-1" onClick={() => setConfigure(false)}>
							<X strokeWidth={1} />
						</button>
						<label title={'Use relay'} class="mx-1">
							<input
								type="checkbox"
								checked={relay[id] ?? false}
								onInput={(e) => {
									setRelay((r) => ({
										...r,
										[id]: (e.target as HTMLInputElement).checked,
									}))
								}}
								class="me-1"
							/>
							<RouterIcon strokeWidth={1} />
						</label>
						{[
							{ name: 'REMOTE_CTRL', color: 'white' },
							{ name: 'RED', color: 'RED' },
							{ name: 'GREEN', color: '#18d718' },
							{ name: 'BLUE', color: '#1c8afb' },
						].map(({ color, name }) => (
							<>
								<button
									type="button me-1"
									style={{ color }}
									onClick={() => {
										const nrplusCtrl = viaRelay(relay[id] ?? false)(
											`LED_${name} ON`,
										)
										console.log(`[NR+]`, nrplusCtrl)
										send({
											deviceId: gateway.id,
											code: localStorage.getItem(`${gateway.id}:code`),
											nrplusCtrl,
										})
									}}
								>
									<Lightbulb strokeWidth={2} />
								</button>
								<button
									type="button me-1"
									style={{ color }}
									onClick={() => {
										const nrplusCtrl = viaRelay(relay[id] ?? false)(
											`LED_${name} OFF`,
										)
										console.log(`[NR+]`, nrplusCtrl)
										send({
											deviceId: gateway.id,
											code: localStorage.getItem(`${gateway.id}:code`),
											nrplusCtrl,
										})
									}}
								>
									<LightbulbOff strokeWidth={1} />
								</button>
							</>
						))}
					</span>
				)}
			</dd>
			{node.btn !== undefined && (
				<ButtonPress
					buttonPress={{
						v: node.btn.n,
						ts: node.btn.ts,
					}}
				/>
			)}
		</>
	)
}
