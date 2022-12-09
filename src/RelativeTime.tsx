import { useEffect, useState } from 'preact/hooks'

export const RelativeTime = ({ time }: { time: Date }) => {
	const format = () => {
		const seconds = Math.floor((Date.now() - time.getTime()) / 1000)
		if (seconds < 60) return `${seconds} s`
		const minutes = Math.floor(seconds / 60)
		return `${minutes} m`
	}
	const [formatted, setFormatted] = useState<string>(format())

	useEffect(() => {
		const i = setInterval(() => {
			setFormatted(format())
		}, 1000)

		return () => {
			clearInterval(i)
		}
	}, [time])

	return <time dateTime={time.toISOString()}>{formatted}</time>
}
