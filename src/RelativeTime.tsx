import { useEffect, useState } from 'preact/hooks'

const formatDistance = (time: Date): string => {
	const seconds = Math.floor((Date.now() - time.getTime()) / 1000)
	if (seconds < 60) return `${seconds} s`
	const minutes = Math.floor(seconds / 60)
	if (minutes < 60) return `${minutes} m`
	const hours = Math.floor(minutes / 60)
	return `${hours} h`
}

export const RelativeTime = ({
	time,
	updatedIntervalSeconds = 1,
}: {
	time: Date
	updatedIntervalSeconds?: number
}) => {
	const [formatted, setFormatted] = useState<string>(formatDistance(time))

	useEffect(() => {
		const i = setInterval(() => {
			setFormatted(formatDistance(time))
		}, 1000 * updatedIntervalSeconds)

		return () => {
			clearInterval(i)
		}
	}, [time])

	return <time dateTime={time.toISOString()}>{formatted}</time>
}
