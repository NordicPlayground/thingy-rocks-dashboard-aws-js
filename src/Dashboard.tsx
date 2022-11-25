import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'preact/hooks'
import { useDeviceMessages } from './context/DeviceMessage'
import { useWebsocket } from './context/WebsocketConnection'

export const Dashboard = () => {
	const { messages } = useDeviceMessages()
	const { connected } = useWebsocket()

	return (
		<section>
			<h1>thingy.rocks Dashboard</h1>
			<dl>
				<dt>Connected</dt>
				<dd>
					<code>{JSON.stringify(connected)}</code>
				</dd>
			</dl>
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
