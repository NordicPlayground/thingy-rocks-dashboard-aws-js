import { UploadCloud } from 'lucide-preact'
import { CountryFlag } from './CountryFlag.js'
import { LastUpdate, Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import type { VideoDevice } from './DeviceType.ts'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'
import { useDevices } from './context/Devices.js'
import { ThingyIcon } from './icons/ThingyIcon.js'

export const VideoDeviceTile = ({ device }: { device: VideoDevice }) => {
	const { lastUpdateTs, videoStream } = useDevices()

	const maybeLastUpdateTime = lastUpdateTs[device.id]

	const streamArn = videoStream(device.id)

	console.log(device.id, device, streamArn)

	return (
		<>
			<Title onClick={() => {}}>
				<ThingyIcon class="icon" />
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
			{streamArn !== undefined && <StreamPreview streamArn={streamArn} />}
		</>
	)
}

const StreamPreview = ({ streamArn }: { streamArn: string }) => {
	void streamArn
	return null
}
