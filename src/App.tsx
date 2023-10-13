import { Provider as DevicesProvider } from './context/Devices.js'
import { Provider as MapProvider } from './context/Map.js'
import { Provider as SettingsProvider } from './context/Settings.js'
import { Provider as HistoryChartProvider } from './context/showHistoryChart.js'
import { Provider as WebsocketProvider } from './context/WebsocketConnection.js'
import { Dashboard } from './Dashboard.js'
import { FakeTracker } from './test-device/FakeTracker.js'
import { WithCredentials as CredentialsProvider } from './WithCredentials.js'

export const App = () => (
	<>
		<CredentialsProvider>
			{(credentials) => (
				<SettingsProvider>
					<DevicesProvider>
						<WebsocketProvider>
							<MapProvider credentials={credentials}>
								<HistoryChartProvider>
									<Dashboard />
								</HistoryChartProvider>
							</MapProvider>
						</WebsocketProvider>
						<FakeTracker />
					</DevicesProvider>
				</SettingsProvider>
			)}
		</CredentialsProvider>
	</>
)
