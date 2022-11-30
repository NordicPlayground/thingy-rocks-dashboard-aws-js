import Router, { Route } from 'preact-router'
import { Provider as CredentialsProvider } from './context/credentials'
import { Provider as DevicesProvider } from './context/Devices'
import { Provider as MapProvider } from './context/Map'
import { Provider as WebsocketProvider } from './context/WebsocketConnection'
import { Dashboard } from './Dashboard'

export const App = () => (
	<CredentialsProvider>
		<DevicesProvider>
			<WebsocketProvider>
				<MapProvider>
					<Router>
						<Route path="/" component={Dashboard} />
					</Router>
				</MapProvider>
			</WebsocketProvider>
		</DevicesProvider>
	</CredentialsProvider>
)
