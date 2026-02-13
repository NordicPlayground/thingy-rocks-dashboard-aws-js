import Hls from 'hls.js'
import { Play, UploadCloud, X } from 'lucide-preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { useAuth } from './context/Auth.tsx'
import { useDevices } from './context/Devices.js'
import { CountryFlag } from './CountryFlag.js'
import { LastUpdate, Title } from './DeviceList.js'
import { DeviceName } from './DeviceName.js'
import type { VideoDevice } from './DeviceType.ts'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { fetchKinesisHlsUrl } from './kinesis/fetchKinesisHlsUrl.js'
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

	return credentials !== undefined ? (
		<StreamPreviewWithPlay
			streamArn={streamArn}
			imageUrl={imageUrl}
			credentials={credentials}
		/>
	) : null
}

const streamPreviewContainerStyle = {
	aspectRatio: '16/9' as const,
	marginTop: '0.5rem',
	borderRadius: '4px',
	backgroundColor: 'var(--color-panel-bg)',
	position: 'relative' as const,
	overflow: 'hidden' as const,
	width: '100%',
}

const StreamPreviewWithPlay = ({
	streamArn,
	imageUrl,
	credentials,
}: {
	streamArn: string
	imageUrl: string
	credentials: NonNullable<ReturnType<typeof useAuth>['credentials']>
}) => {
	const [isPlaying, setIsPlaying] = useState(false)
	const [hlsUrl, setHlsUrl] = useState<string | null>(null)
	const [hlsError, setHlsError] = useState<string | null>(null)
	const [hlsLoading, setHlsLoading] = useState(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const hlsRef = useRef<Hls | null>(null)

	const stopPlaying = useCallback(() => {
		if (hlsRef.current) {
			hlsRef.current.destroy()
			hlsRef.current = null
		}
		if (videoRef.current) {
			videoRef.current.pause()
			videoRef.current.src = ''
		}
		setIsPlaying(false)
		setHlsUrl(null)
	}, [])

	const handlePlayClick = useCallback(async () => {
		if (credentials === undefined) return
		setHlsLoading(true)
		setHlsError(null)
		try {
			const url = await fetchKinesisHlsUrl(streamArn, credentials)
			if (url === null) {
				setHlsError('Could not get stream URL')
				return
			}
			setHlsUrl(url)
			setIsPlaying(true)
		} catch (err) {
			setHlsError(err instanceof Error ? err.message : String(err))
		} finally {
			setHlsLoading(false)
		}
	}, [streamArn, credentials])

	useEffect(() => {
		if (!isPlaying || hlsUrl === null) {
			return
		}

		const video = videoRef.current
		if (video === null) {
			return
		}

		if (Hls.isSupported()) {
			const hls = new Hls({
				enableWorker: true,
				lowLatencyMode: true,
			})
			hlsRef.current = hls
			hls.loadSource(hlsUrl)
			hls.attachMedia(video)
			hls.on(Hls.Events.ERROR, (_, data) => {
				if (data.fatal) {
					hls.destroy()
					hlsRef.current = null
					setHlsError(
						data.type === Hls.ErrorTypes.NETWORK_ERROR
							? 'Stream unavailable'
							: 'Playback error',
					)
					setIsPlaying(false)
				}
			})
			return () => {
				hls.destroy()
				hlsRef.current = null
			}
		}

		// Safari and Edge have native HLS support
		if (video.canPlayType('application/vnd.apple.mpegurl')) {
			video.src = hlsUrl
			return
		}
		return
	}, [isPlaying, hlsUrl])

	return (
		<div style={streamPreviewContainerStyle}>
			{isPlaying ? (
				<>
					<video
						ref={videoRef}
						controls
						autoplay
						muted
						playsInline
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
							display: 'block',
						}}
						onClick={(e) => e.stopPropagation()}
					/>
					<button
						type="button"
						onClick={stopPlaying}
						aria-label="Stop playback"
						style={{
							position: 'absolute',
							top: '0.5rem',
							right: '0.5rem',
							padding: '0.25rem',
							background: 'rgba(0,0,0,0.6)',
							border: 'none',
							borderRadius: '4px',
							color: 'white',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<X size={16} strokeWidth={1.5} />
					</button>
				</>
			) : (
				<>
					<img
						src={imageUrl}
						alt="Live stream preview"
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'contain',
							display: 'block',
						}}
					/>
					<button
						type="button"
						onClick={handlePlayClick}
						disabled={hlsLoading}
						aria-label="Play live stream"
						style={{
							position: 'absolute',
							inset: 0,
							margin: 'auto',
							width: '4rem',
							height: '4rem',
							padding: 0,
							background: 'rgba(0,0,0,0.5)',
							border: 'none',
							borderRadius: '50%',
							color: 'white',
							cursor: hlsLoading ? 'wait' : 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transition: 'background 0.2s',
						}}
					>
						{hlsLoading ? (
							<span style={{ fontSize: '0.875rem' }}>…</span>
						) : (
							<Play size={32} fill="currentColor" strokeWidth={1.5} />
						)}
					</button>
					{hlsError !== null && (
						<span
							style={{
								position: 'absolute',
								bottom: '0.5rem',
								left: '0.5rem',
								right: '0.5rem',
								color: 'white',
								fontSize: '0.75rem',
								textShadow: '0 1px 2px rgba(0,0,0,0.8)',
								textAlign: 'center',
							}}
						>
							{hlsError}
						</span>
					)}
				</>
			)}
		</div>
	)
}
