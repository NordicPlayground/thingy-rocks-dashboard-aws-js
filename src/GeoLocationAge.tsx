import { intlFormatDistance } from 'date-fns'
import { useEffect, useState } from 'preact/hooks'

const formatDiff = (date: Date): string =>
	intlFormatDistance(date, new Date(), { style: 'narrow' })

export const GeoLocationAge = ({ age }: { age: Date }) => {
	const [diff, setDiff] = useState<string>(formatDiff(age))

	useEffect(() => {
		const i = setInterval(() => {
			setDiff(formatDiff(age))
		}, 1000 * 10)
		return () => {
			clearInterval(i)
		}
	}, [location])

	return <time dateTime={age.toISOString()}>{diff}</time>
}
