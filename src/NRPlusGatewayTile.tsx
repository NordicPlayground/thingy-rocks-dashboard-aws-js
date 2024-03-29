import {
	useDevices,
	type NRPlusGateway,
	type NRPlusNode,
	type GeoLocation,
} from './context/Devices.js'
import { DeviceName } from './DeviceName.js'
import { LastUpdate, Properties, Title } from './DeviceList.js'
import { NRPlus } from './icons/NRPlus.js'
import {
	Focus,
	Hexagon,
	KeyRound,
	Lightbulb,
	LightbulbOff,
	Lock,
	RouterIcon,
	Thermometer,
	UnlockIcon,
	UploadCloud,
	X,
} from 'lucide-preact'
import { RelativeTime } from './RelativeTime.js'
import { ShowWhenHot } from './ShowWhenHot.js'
import { useState } from 'preact/hooks'
import { useWebsocket } from './context/WebsocketConnection.js'
import { sortLocations } from './sortLocations.js'
import { removeOldLocation } from './removeOldLocation.js'
import { NRPlusTopology } from './nrplus/NRPlusTopology.js'
import { PinTile } from './PinTile.js'
import { ConfigureCode } from './ConfigureCode.js'
import { useSettings } from './context/Settings.js'
import { withCancel } from './cancelEvent.js'
import { hideDetails } from './hooks/useDetails.js'

export const NRPlusGatewayTile = ({
	gateway,
	onCenter,
}: {
	gateway: NRPlusGateway
	onCenter: (location: GeoLocation) => void
}) => {
	const {
		settings: { managementCodes },
	} = useSettings()
	const { lastUpdateTs } = useDevices()
	const lastUpdateTime = lastUpdateTs(gateway.id) as number
	const [configureCode, setConfigureCode] = useState<boolean>(false)
	const { location } = gateway
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]
	const hasCode = managementCodes[gateway.id] !== undefined

	return (
		<>
			<Title
				type={'button'}
				onClick={withCancel(() => {
					if (deviceLocation !== undefined) {
						onCenter(deviceLocation)
					}
					hideDetails()
				})}
			>
				<NRPlus class="icon" />
				<span class="info">
					<DeviceName device={gateway} />
				</span>
				<button
					type="button"
					onClick={withCancel(() => setConfigureCode((c) => !c))}
				>
					{hasCode ? (
						<UnlockIcon strokeWidth={1} class="ms-2 p-1" />
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
			{gateway.state.topology !== undefined && (
				<>
					<NRPlusTopology
						topology={gateway.state.topology}
						size={{ width: 250, height: 150 }}
					/>
				</>
			)}
			<Properties>
				{configureCode && (
					<>
						<dt>
							<KeyRound strokeWidth={1} class="ms-2 p-1" />
						</dt>
						<dd class="d-flex my-2">
							<ConfigureCode
								device={gateway}
								onCode={() => {
									setConfigureCode(false)
								}}
							/>
						</dd>
					</>
				)}
				{Object.entries(gateway.state.nodes).map(([id, node]) => (
					<Node id={id} node={node} gateway={gateway} hasCode={hasCode} />
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
	const {
		settings: { managementCodes },
	} = useSettings()
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
	const tempTs = node.env?.ts
	const tempIsCurrent = Date.now() - (tempTs ?? 0) < 60 * 60 * 1000

	return (
		<>
			<dt>
				<Hexagon strokeWidth={1} class="ms-2 p-1" /> {id}
			</dt>
			<dd>
				{!configure && (
					<span class="p-1">
						{hasCode && (
							<button
								type="button"
								class="me-2"
								onClick={() => setConfigure(true)}
							>
								<Lightbulb strokeWidth={1} />
							</button>
						)}
						{temp !== undefined && tempIsCurrent && (
							<>
								<span>
									<Thermometer strokeWidth={1} />
									<span>{temp.toFixed(1)} °C</span>
								</span>
								{tempTs !== undefined && (
									<small class={'ms-2'} style={{ opacity: 0.75 }}>
										<UploadCloud
											strokeWidth={1}
											style={{ width: '18px' }}
											class={'me-1'}
										/>
										<RelativeTime time={new Date(tempTs)} />
									</small>
								)}
							</>
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
											code: managementCodes[gateway.id],
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
											code: managementCodes[gateway.id],
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
				<>
					<ShowWhenHot ts={new Date(node.btn.ts)}>
						{(diffSeconds) => (
							<>
								<dt style={{ color: 'var(--color-nordic-pink)' }}>
									<span class={'ms-3'}>└</span>
									<Focus strokeWidth={3} class="ms-2 p-1" />
								</dt>
								<dd style={{ color: 'var(--color-nordic-pink)' }}>
									<strong>{diffSeconds} seconds ago</strong>
								</dd>
							</>
						)}
					</ShowWhenHot>
				</>
			)}
		</>
	)
}
