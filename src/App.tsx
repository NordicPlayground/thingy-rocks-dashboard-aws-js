import Router, { Route } from 'preact-router'
import { Provider as DeviceMessagesProvider } from './context/DeviceMessage'
import { Provider as WebsocketProvider } from './context/WebsocketConnection'
import { Dashboard } from './Dashboard'

export const App = ({ websocketEndpoint }: { websocketEndpoint: string }) => (
	<>
		<main class="container">
			<DeviceMessagesProvider>
				<WebsocketProvider websocketEndpoint={new URL(websocketEndpoint)}>
					<Router>
						<Route path="/" component={Dashboard} />
					</Router>
				</WebsocketProvider>
			</DeviceMessagesProvider>
		</main>
	</>
)
