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
	Thermometer,
	UploadCloud,
	X,
} from 'lucide-preact'
import { RelativeTime } from './RelativeTime.js'
import { ButtonPress } from './ButtonPress.js'
import { useState } from 'preact/hooks'
import { useWebsocket } from './context/WebsocketConnection.js'

export const NRPlusGatewayTile = ({ gateway }: { gateway: NRPlusGateway }) => {
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const [configureCode, setConfigureCode] = useState<boolean>(false)
	const key = `${gateway.id}:code`
	const [deviceCode, setDeviceCode] = useState<string>(
		localStorage.getItem(key) ?? '',
	)
	return (
		<>
			<Title type={'button'}>
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
					<Node id={id} node={node} gateway={gateway} />
				))}
			</Properties>
		</>
	)
}

const Node = ({
	id,
	node,
	gateway,
}: {
	id: string
	gateway: NRPlusGateway
	node: NRPlusNode
}) => {
	const [configure, setConfigure] = useState<boolean>(false)
	const { send } = useWebsocket()

	return (
		<>
			<dt>
				<Hexagon strokeWidth={1} class="ms-2 p-1" /> {id}
			</dt>
			<dd>
				{!configure && (
					<span class="p-1">
						<button
							type="button"
							class="me-2"
							onClick={() => setConfigure(true)}
						>
							<Lightbulb strokeWidth={1} />
						</button>
						{node.env !== undefined && (
							<span>
								<Thermometer strokeWidth={1} /> {node.env.temp.toFixed(1)} °C
							</span>
						)}
					</span>
				)}
				{configure && (
					<span class="p-1">
						<button type="button me-1" onClick={() => setConfigure(false)}>
							<X strokeWidth={1} />
						</button>
						<button type="button me-1" onClick={() => setConfigure(false)}>
							<LightbulbOff strokeWidth={2} />
						</button>
						{[
							{ name: 'RED', color: 'RED' },
							{ name: 'GREEN', color: '#18d718' },
							{ name: 'BLUE', color: '#1c8afb' },
						].map(({ color, name }) => (
							<>
								<button
									type="button me-1"
									style={{ color }}
									onClick={() => {
										setConfigure(false)
										send({
											code: localStorage.getItem(`${gateway.id}:code`),
											nrplusCtrl: `dect beacon_rach_tx -t ${id} -d "LED_${name} ON"`,
										})
									}}
								>
									<Lightbulb strokeWidth={2} />
								</button>
								<button
									type="button me-1"
									style={{ color }}
									onClick={() => {
										setConfigure(false)
										send({
											code: localStorage.getItem(`${gateway.id}:code`),
											nrplusCtrl: `dect beacon_rach_tx -t ${id} -d "LED_${name} OFF"`,
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
