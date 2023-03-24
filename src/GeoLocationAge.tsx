import { intlFormatDistance } from 'date-fns'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { type GeoLocation } from './context/Devices'

const Age = styled.time``

const formatDiff = (date: Date): string =>
	intlFormatDistance(date, new Date(), { style: 'narrow' })

export const GeoLocationAge = ({ location }: { location: GeoLocation }) => {
	const [diff, setDiff] = useState<string>(
		formatDiff(location.ts ?? new Date()),
	)

	useEffect(() => {
		if (location.ts === undefined) return
		const i = setInterval(() => {
			setDiff(formatDiff(location.ts as Date))
		}, 1000 * 10)
		return () => {
			clearInterval(i)
		}
	}, [location])

	if (location.ts === undefined) return null

	return <Age dateTime={location.ts.toISOString()}>{diff}</Age>
}
