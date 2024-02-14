import { Provider as DevicesProvider } from './context/Devices.js'
import { Provider as LwM2MProvider } from './context/LwM2M.js'
import { Provider as MapProvider } from './context/Map.js'
import { Provider as SettingsProvider } from './context/Settings.js'
import { Provider as HistoryChartProvider } from './context/showHistoryChart.js'
import { Provider as WirepasTopologyProvider } from './context/showWirepasTopology.js'
import { Provider as VisibleDevicesProvider } from './context/VisibleDevices.js'
import { Provider as WebsocketProvider } from './context/WebsocketConnection.js'
import { Dashboard } from './Dashboard.js'
import { FakeTracker } from './test-device/FakeTracker.js'
import { WithMapAuthHelper as MapAuthHelperProvider } from './WithMapAuthHelper.js'

export const App = () => (
	<MapAuthHelperProvider>
		{(authHelper) => (
			<SettingsProvider>
				<DevicesProvider>
					<VisibleDevicesProvider>
						<WebsocketProvider>
							<LwM2MProvider>
								<MapProvider authHelper={authHelper}>
									<HistoryChartProvider>
										<WirepasTopologyProvider>
											<Dashboard />
										</WirepasTopologyProvider>
									</HistoryChartProvider>
								</MapProvider>
							</LwM2MProvider>
						</WebsocketProvider>
					</VisibleDevicesProvider>
					<FakeTracker />
				</DevicesProvider>
			</SettingsProvider>
		)}
	</MapAuthHelperProvider>
)
