import { UploadCloud } from 'lucide-preact'
import { BoardIcon } from '../BoardIcon.tsx'
import { useAuth } from '../context/Auth.tsx'
import { useDevices } from '../context/Devices.tsx'
import { CountryFlag } from '../CountryFlag.tsx'
import { LastUpdate, Properties, Title } from '../DeviceList.tsx'
import { DeviceName } from '../DeviceName.tsx'
import type { VideoDevice } from '../DeviceType.ts'
import { PinTile } from '../PinTile.tsx'
import { RelativeTime } from '../RelativeTime.tsx'
import { TrackerSensorData } from '../TrackerSensorData.tsx'
import { LoginRequiredForStreamNote } from './LoginRequiredForStreamNote.tsx'
import { StreamPreview } from './StreamPreview.tsx'
import { StreamStatusIndicator } from './StreamStatusIndicator.tsx'

export const VideoDeviceTile = ({ device }: { device: VideoDevice }) => {
	const { lastUpdateTs } = useDevices()
	const { isLoggedIn } = useAuth()
	const maybeLastUpdateTime = lastUpdateTs[device.id]

	return (
		<>
			<Title onClick={() => {}}>
				<BoardIcon device={device} />
				<StreamStatusIndicator device={device} />
				<span class="info">
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
			{isLoggedIn && <StreamPreview device={device} />}
			{!isLoggedIn && <LoginRequiredForStreamNote device={device} />}
			<Properties style={{ marginTop: '0.5em' }}>
				<TrackerSensorData device={device} />
			</Properties>
		</>
	)
}
