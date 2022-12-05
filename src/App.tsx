import Router, { Route } from 'preact-router'
import { Provider as DevicesProvider } from './context/Devices'
import { Provider as MapProvider } from './context/Map'
import { Provider as WebsocketProvider } from './context/WebsocketConnection'
import { Dashboard } from './Dashboard'
import { WithCredentials as CredentialsProvider } from './WithCredentials'

export const App = () => (
	<CredentialsProvider>
		{(credentials) => (
			<DevicesProvider>
				<WebsocketProvider>
					<MapProvider credentials={credentials}>
						<Router>
							<Route path="/" component={Dashboard} />
						</Router>
					</MapProvider>
				</WebsocketProvider>
			</DevicesProvider>
		)}
	</CredentialsProvider>
)
