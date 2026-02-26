import { AlertTriangle } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { useAuth } from '../context/Auth.tsx'
import { useDevices } from '../context/Devices.tsx'
import type { VideoDevice } from '../DeviceType.ts'
import {
	fetchLatestKinesisImage,
	type FetchLatestKinesisImageResult,
} from './kinesis/fetchLatestImage.js'
import { StreamPreviewWithPlay } from './StreamPreviewWithPlay.tsx'

export const StreamPreview = ({ device }: { device: VideoDevice }) => {
	const { videoStream } = useDevices()
	const streamArn = videoStream(device.id)
	const [preview, setPreview] = useState<{
		imageUrl: string
		startTimestamp: Date
	} | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)
	const { credentials } = useAuth()

	useEffect(() => {
		if (credentials === undefined || streamArn === undefined) return
		let cancelled = false
		setLoading(true)
		setError(null)
		setPreview(null)

		const doFetch = () => {
			fetchLatestKinesisImage(streamArn, credentials)
				.then((result: FetchLatestKinesisImageResult | null) => {
					if (!cancelled && result !== null) {
						setPreview(result)
					}
				})
				.catch((err: unknown) => {
					if (!cancelled) {
						setError(err instanceof Error ? err.message : String(err))
					}
				})
				.finally(() => {
					if (!cancelled) {
						setLoading(false)
					}
				})
		}

		doFetch()
		const interval = setInterval(doFetch, 60 * 1000)

		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [streamArn, credentials])

	if (streamArn === undefined || credentials === undefined) return null

	if (loading) {
		return (
			<p class="mt-1 ms-3">
				<small>Loading stream…</small>
			</p>
		)
	}

	if (error !== null) {
		return (
			<p class="mt-1 ms-3">
				<small>
					<AlertTriangle class="me-1" />
					{error}
				</small>
			</p>
		)
	}

	if (preview === null) {
		return (
			<p class="mt-1 ms-3">
				<small>No recent frame available</small>
			</p>
		)
	}

	return (
		<StreamPreviewWithPlay
			device={device}
			imageUrl={preview.imageUrl}
			startTimestamp={preview.startTimestamp}
		/>
	)
}
