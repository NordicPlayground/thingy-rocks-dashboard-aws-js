import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'preact/hooks'

export const RelativeTime = ({ time }: { time: Date }) => {
	const format = () => formatDistanceToNow(time, { addSuffix: true })
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
