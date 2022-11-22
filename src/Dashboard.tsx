import { useDeviceMessages } from './context/DeviceMessage'
import { useWebsocket } from './context/WebsocketConnection'

export const Dashboard = () => {
	const { messages } = useDeviceMessages()
	const { connected } = useWebsocket()

	return (
		<section>
			<h1>Hello World!</h1>
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
								<time dateTime={ts}>{ts}</time> {JSON.stringify(message)}
							</li>
						))}
					</ul>
				</>
			))}
		</section>
	)
}
