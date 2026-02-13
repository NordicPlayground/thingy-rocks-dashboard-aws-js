import { UploadCloud } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { useAuth } from './context/Auth.tsx'
import { useDevices } from './context/Devices.js'
import { CountryFlag } from './CountryFlag.js'
import { LastUpdate, Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import type { VideoDevice } from './DeviceType.ts'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { fetchLatestKinesisImage } from './kinesis/fetchLatestImage.js'
import { PinTile } from './PinTile.js'
import { RelativeTime } from './RelativeTime.js'

export const VideoDeviceTile = ({ device }: { device: VideoDevice }) => {
	const { lastUpdateTs, videoStream } = useDevices()
	const { credentials, isLoggedIn } = useAuth()
	const maybeLastUpdateTime = lastUpdateTs[device.id]
	const streamArn = videoStream(device.id)

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
			{streamArn !== undefined && credentials !== undefined && isLoggedIn && (
				<StreamPreview streamArn={streamArn} />
			)}
		</>
	)
}

const StreamPreview = ({ streamArn }: { streamArn: string }) => {
	const [imageUrl, setImageUrl] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const { credentials } = useAuth()

	useEffect(() => {
		if (credentials === undefined) return
		let cancelled = false
		setLoading(true)
		setError(null)
		setImageUrl(null)

		fetchLatestKinesisImage(streamArn, credentials)
			.then((url) => {
				if (!cancelled) {
					setImageUrl(url)
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : String(err))
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false)
				}
			})

		return () => {
			cancelled = true
		}
	}, [streamArn, credentials])

	if (loading) {
		return (
			<div
				style={{
					aspectRatio: '16/9',
					backgroundColor: 'var(--color-panel-bg)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: '0.5rem',
					borderRadius: '4px',
				}}
			>
				<span
					style={{
						color: 'var(--color-nordic-light-grey)',
						fontSize: '0.875rem',
					}}
				>
					Loading stream…
				</span>
			</div>
		)
	}

	if (error !== null) {
		return (
			<div
				style={{
					aspectRatio: '16/9',
					backgroundColor: 'var(--color-panel-bg)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: '0.5rem',
					borderRadius: '4px',
				}}
			>
				<span
					style={{
						color: 'var(--color-nordic-light-grey)',
						fontSize: '0.875rem',
					}}
				>
					{error}
				</span>
			</div>
		)
	}

	if (imageUrl === null) {
		return (
			<div
				style={{
					aspectRatio: '16/9',
					backgroundColor: 'var(--color-panel-bg)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginTop: '0.5rem',
					borderRadius: '4px',
				}}
			>
				<span
					style={{
						color: 'var(--color-nordic-light-grey)',
						fontSize: '0.875rem',
					}}
				>
					No recent frame available
				</span>
			</div>
		)
	}

	return (
		<img
			src={imageUrl}
			alt="Live stream preview"
			style={{
				width: '100%',
				aspectRatio: '16/9',
				objectFit: 'contain',
				marginTop: '0.5rem',
				borderRadius: '4px',
				backgroundColor: 'var(--color-panel-bg)',
			}}
		/>
	)
}
