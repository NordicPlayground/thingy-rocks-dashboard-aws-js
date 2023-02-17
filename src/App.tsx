import { Provider as DevicesProvider } from './context/Devices'
import { Provider as MapProvider } from './context/Map'
import { Provider as SettingsProvider } from './context/Settings'
import { Provider as HistoryChartProvider } from './context/showHistoryChart'
import { Provider as MeshTopologyProvider } from './context/showMeshTopology'
import { Provider as WebsocketProvider } from './context/WebsocketConnection'
import { Dashboard } from './Dashboard'
import { FakeLight } from './test-device/FakeLight'
import { FakeMeshNode } from './test-device/FakeMeshNode'
import { FakeTracker } from './test-device/FakeTracker'
import { WithCredentials as CredentialsProvider } from './WithCredentials'

export const App = () => (
	<>
		<CredentialsProvider>
			{(credentials) => (
				<SettingsProvider>
					<DevicesProvider>
						<WebsocketProvider>
							<MapProvider credentials={credentials}>
								<HistoryChartProvider>
									<MeshTopologyProvider>
										<Dashboard />
									</MeshTopologyProvider>
								</HistoryChartProvider>
							</MapProvider>
						</WebsocketProvider>
						<FakeTracker />
						<FakeLight />
						<FakeMeshNode />
					</DevicesProvider>
				</SettingsProvider>
			)}
		</CredentialsProvider>
	</>
)
