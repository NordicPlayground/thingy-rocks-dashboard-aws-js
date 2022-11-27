import Router, { Route } from 'preact-router'
import { Provider as CredentialsProvider } from './context/credentials'
import { Provider as DeviceMessagesProvider } from './context/DeviceMessage'
import { Provider as WebsocketProvider } from './context/WebsocketConnection'
import { Dashboard } from './Dashboard'

export const App = () => (
	<CredentialsProvider>
		<DeviceMessagesProvider>
			<WebsocketProvider>
				<Router>
					<Route path="/" component={Dashboard} />
				</Router>
			</WebsocketProvider>
		</DeviceMessagesProvider>
	</CredentialsProvider>
)
