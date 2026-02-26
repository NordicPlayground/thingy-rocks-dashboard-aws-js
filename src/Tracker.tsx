import { UploadCloud, Wifi } from 'lucide-preact'
import { CountryFlag } from './CountryFlag.js'
import { LastUpdate, Properties, ShieldIcon, Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import type { Device, GeoLocation } from './DeviceType.ts'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'
import { TrackerSensorData } from './TrackerSensorData.tsx'
import { wifiColor } from './colors.js'
import { useDevices } from './context/Devices.js'
import { showDetails } from './hooks/useDetails.js'
import { DKIcon } from './icons/DKIcon.js'
import { IridiumIcon } from './icons/Iridium.tsx'
import { KeysightIcon } from './icons/Keysight.js'
import { MyriotaIcon } from './icons/Myriota.js'
import { SateliotIcon } from './icons/SateliotIcon.tsx'
import { SkyloIcon } from './icons/Skylo.js'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { ThingyXIcon } from './icons/ThingyXIcon.js'
import { removeOldLocation } from './removeOldLocation.js'
import { sortLocations } from './sortLocations.js'

const BoardIcon = ({ device }: { device: Device }) => {
	if ((device.id, device.state?.roam?.v?.mccmnc === 90197))
		return <SateliotIcon class="icon" style={{ padding: '2px 0' }} />
	const brdV = device.state?.dev?.v?.brdV
	if ((device.id, device.state?.roam?.v?.mccmnc === 90103))
		return <IridiumIcon class="icon" />
	if (brdV?.includes('keysight') ?? false) return <KeysightIcon class="icon" />
	if (brdV?.includes('skylo') ?? false)
		return <SkyloIcon class="icon" style={{ padding: '2px 0' }} />
	if (brdV?.includes('myriota') ?? false) return <MyriotaIcon class="icon" />
	if (brdV?.includes('nrf9160dk') ?? false) return <DKIcon class="icon" />
	if (brdV?.includes('thingy91x') ?? false) return <ThingyXIcon class="icon" />
	return <ThingyIcon class="icon" />
}

export const Tracker = ({
	device,
	onCenter,
}: {
	device: Device
	onCenter: (location: GeoLocation) => void
}) => {
	const { lastUpdateTs } = useDevices()

	const { location } = device
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const deviceLocation = rankedLocations[0]

	const { appV } = device.state?.dev?.v ?? {}

	const maybeLastUpdateTime = lastUpdateTs[device.id]

	return (
		<>
			<Title
				onClick={() => {
					if (deviceLocation !== undefined) {
						onCenter(deviceLocation)
					}
					showDetails(device.id)
				}}
			>
				<BoardIcon device={device} />
				<span class="info">
					{appV?.includes('wifi') === true && (
						<ShieldIcon>
							<Wifi
								style={{
									color: wifiColor,
								}}
							/>
						</ShieldIcon>
					)}
					<DeviceName device={device} />
				</span>
				<CountryFlag device={device} />
				{maybeLastUpdateTime !== undefined && (
					<LastUpdate title="Last update">
						<UploadCloud strokeWidth={1} />
						<RelativeTime time={maybeLastUpdateTime} />
					</LastUpdate>
				)}
				<PinTile device={device} />
			</Title>
			<Properties>
				<TrackerSensorData device={device} />
			</Properties>
		</>
	)
}
