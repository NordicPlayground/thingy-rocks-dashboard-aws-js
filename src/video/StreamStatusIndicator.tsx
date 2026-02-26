import { useCallback, useEffect, useState } from 'preact/hooks'
import { useAuth } from '../context/Auth.tsx'
import { useDevices } from '../context/Devices.tsx'
import type { VideoDevice } from '../DeviceType.ts'
import {
	fetchStreamStatus,
	type StreamStatus,
} from './dynamodb/fetchStreamStatus.js'

export const StreamStatusIndicator = ({ device }: { device: VideoDevice }) => {
	const { credentials } = useAuth()
	const { videoStream } = useDevices()
	const streamArn = videoStream(device.id)
	const [status, setStatus] = useState<StreamStatus | undefined>(undefined)

	const fetch = useCallback(() => {
		if (streamArn === undefined || credentials === undefined) return
		fetchStreamStatus(streamArn, credentials)
			.then((s: StreamStatus) => setStatus(s))
			.catch(() => setStatus(null))
	}, [streamArn, credentials])

	useEffect(() => {
		if (streamArn === undefined || credentials === undefined) return
		setStatus(undefined)
		fetch()
		const interval = setInterval(fetch, 60 * 1000)
		return () => clearInterval(interval)
	}, [fetch, streamArn, credentials])

	if (
		streamArn === undefined ||
		credentials === undefined ||
		status === undefined
	)
		return null

	const isActive = status === 'active'
	return (
		<span
			style={{
				width: 8,
				height: 8,
				borderRadius: '50%',
				backgroundColor: isActive
					? '#20e899'
					: 'var(--color-nordic-middle-grey)',
				flexShrink: 0,
				marginRight: '0.5rem',
			}}
			title={isActive ? 'Stream active' : 'Stream inactive'}
		/>
	)
}
