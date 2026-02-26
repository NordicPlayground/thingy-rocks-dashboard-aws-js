import { LogInIcon } from 'lucide-preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useAuth } from '../context/Auth.tsx'
import { useDevices } from '../context/Devices.tsx'
import type { VideoDevice } from '../DeviceType.ts'
import {
	fetchStreamStatus,
	type StreamStatus,
} from './dynamodb/fetchStreamStatus.ts'

export const LoginRequiredForStreamNote = ({
	device,
}: {
	device: VideoDevice
}) => {
	const { credentials, isLoggedIn, signIn } = useAuth()
	const { videoStream } = useDevices()
	const streamArn = videoStream(device.id)
	const [status, setStatus] = useState<StreamStatus | undefined>(undefined)

	const fetch = useCallback(() => {
		if (streamArn === undefined || credentials === undefined) return
		fetchStreamStatus(streamArn, credentials)
			.then((s) => setStatus(s))
			.catch(() => setStatus(null))
	}, [streamArn, credentials])

	useEffect(() => {
		if (isLoggedIn || streamArn === undefined || credentials === undefined)
			return
		setStatus(undefined)
		fetch()
		const interval = setInterval(fetch, 60 * 1000)
		return () => clearInterval(interval)
	}, [fetch, isLoggedIn, streamArn, credentials])

	if (
		streamArn === undefined ||
		credentials === undefined ||
		isLoggedIn ||
		status !== 'active'
	)
		return null

	return (
		<p class="mt-1 ms-3">
			<small>
				You must <LogInIcon class="me-1" />
				<button
					type="button"
					onClick={() => void signIn()}
					style={{
						background: 'none',
						border: 'none',
						padding: 0,
						font: 'inherit',
						color: 'var(--color-nordic-blue)',
						textDecoration: 'underline',
						cursor: 'pointer',
					}}
				>
					log in
				</button>{' '}
				to see the live stream.
			</small>
		</p>
	)
}
