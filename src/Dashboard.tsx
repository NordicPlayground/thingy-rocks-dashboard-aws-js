import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'preact/hooks'
import { useDeviceMessages } from './context/DeviceMessage'
import { Footer } from './Footer'
import { Logo } from './Logo'
import { Map } from './Map'

export const Dashboard = () => {
	const { messages } = useDeviceMessages()

	return (
		<>
			<Logo />
			<main class="container">
				<section>
					{Object.entries(messages).map(([k, v]) => (
						<>
							<h2>{k}</h2>
							<ul>
								{v.map(({ ts, message }) => (
									<li>
										<RelativeTime time={new Date(ts)} />{' '}
										<pre>
											<small>{JSON.stringify(message, null, 2)}</small>
										</pre>
									</li>
								))}
							</ul>
						</>
					))}
				</section>
			</main>
			<Footer />
			<Map />
		</>
	)
}

const RelativeTime = ({ time }: { time: Date }) => {
	const format = () =>
		formatDistanceToNow(time, { includeSeconds: true, addSuffix: true })
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
