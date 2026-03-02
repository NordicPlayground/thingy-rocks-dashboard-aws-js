import Hls from 'hls.js'
import { Play, X } from 'lucide-preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { useAuth } from '../context/Auth.tsx'
import { useDevices } from '../context/Devices.tsx'
import type { VideoDevice } from '../DeviceType.ts'
import { fetchKinesisHlsUrl } from './kinesis/fetchKinesisHlsUrl.js'

const RETRY_DELAY_INITIAL_MS = 1000
const RETRY_DELAY_MAX_MS = 30000

const streamPreviewContainerStyle = {
	aspectRatio: '16/9' as const,
	marginTop: '0.5rem',
	borderRadius: '4px',
	backgroundColor: 'var(--color-panel-bg)',
	position: 'relative' as const,
	overflow: 'hidden' as const,
	width: '100%',
}

const playbackStartOffsetMs = 10 * 1000

export const StreamPreviewWithPlay = ({
	device,
	imageUrl,
}: {
	device: VideoDevice
	imageUrl: string
}) => {
	const { credentials } = useAuth()
	const { videoStream } = useDevices()
	const streamArn = videoStream(device.id)
	const [isPlaying, setIsPlaying] = useState(false)
	const [hlsUrl, setHlsUrl] = useState<string | null>(null)
	const [hlsError, setHlsError] = useState<string | null>(null)
	const [hlsLoading, setHlsLoading] = useState(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const hlsRef = useRef<Hls | null>(null)
	const userWantsToPlayRef = useRef(false)
	const retryDelayRef = useRef(RETRY_DELAY_INITIAL_MS)

	userWantsToPlayRef.current = isPlaying

	const stopPlaying = useCallback(() => {
		userWantsToPlayRef.current = false
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
		if (credentials === undefined || streamArn === undefined) return
		retryDelayRef.current = RETRY_DELAY_INITIAL_MS
		setHlsLoading(true)
		setHlsError(null)
		try {
			const playbackStart = new Date(Date.now() - playbackStartOffsetMs)
			const url = await fetchKinesisHlsUrl(
				streamArn,
				credentials,
				playbackStart,
			)
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

	const scheduleRetry = useCallback(async () => {
		if (
			!userWantsToPlayRef.current ||
			credentials === undefined ||
			streamArn === undefined
		) {
			return
		}
		const delay = retryDelayRef.current
		await new Promise((r) => setTimeout(r, delay))
		if (!userWantsToPlayRef.current) return
		setHlsError('Reconnecting…')
		try {
			// Omit startTimestamp to use LIVE mode and jump to the live edge
			const url = await fetchKinesisHlsUrl(streamArn, credentials)
			if (!userWantsToPlayRef.current) return
			if (url !== null) {
				retryDelayRef.current = RETRY_DELAY_INITIAL_MS
				setHlsError(null)
				setHlsUrl(url)
			} else {
				retryDelayRef.current = Math.min(
					retryDelayRef.current * 2,
					RETRY_DELAY_MAX_MS,
				)
				void scheduleRetry()
			}
		} catch {
			if (!userWantsToPlayRef.current) return
			retryDelayRef.current = Math.min(
				retryDelayRef.current * 2,
				RETRY_DELAY_MAX_MS,
			)
			void scheduleRetry()
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
				// Disable low-latency mode: it minimizes buffer; we need to buffer
				// the full replay from start to live edge for seek-forward
				lowLatencyMode: false,
				// Buffer aggressively so user can skip forward through entire replay
				// (LIVE_REPLAY + MaxMediaPlaylistFragmentResults supplies segments to now)
				maxBufferLength: 3600, // 1 hr forward buffer
				maxMaxBufferLength: 7200, // allow up to 2 hr
				startFragPrefetch: true,
				// DVR-style: set seekable range from start to live edge
				liveDurationInfinity: true,
			})
			hlsRef.current = hls
			hls.loadSource(hlsUrl)
			hls.attachMedia(video)
			hls.on(Hls.Events.ERROR, (_, data) => {
				if (data.fatal) {
					hls.destroy()
					hlsRef.current = null
					void scheduleRetry()
				}
			})
			return () => {
				hls.destroy()
				hlsRef.current = null
			}
		}

		// Safari and Edge have native HLS support
		if (video.canPlayType('application/vnd.apple.mpegurl')) {
			const onError = async () => scheduleRetry()
			video.addEventListener('error', onError)
			video.src = hlsUrl
			return () => {
				video.removeEventListener('error', onError)
			}
		}
		return
	}, [isPlaying, hlsUrl, scheduleRetry])

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
