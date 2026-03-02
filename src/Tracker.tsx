import { UploadCloud, Wifi } from 'lucide-preact'
import { BoardIcon } from './BoardIcon.tsx'
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
import { removeOldLocation } from './removeOldLocation.js'
import { sortLocations } from './sortLocations.js'

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
