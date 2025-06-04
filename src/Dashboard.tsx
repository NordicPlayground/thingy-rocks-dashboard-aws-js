import { styled } from 'styled-components'
import { AppUpdateNotifier } from './AppUpdateNotifier.js'
import { DeviceList } from './DeviceList.js'
import { GitHubButton } from './GitHubButton.js'
import { FavoritesButton, Settings, SettingsButton } from './Settings.js'
import { DeviceHistory } from './chart/DeviceHistory.js'
import { DeviceLocations } from './map/DeviceLocations.js'
import { ZoomToWorldButton } from './map/ZoomToWorldButton.js'
import { WirepasTopology } from './wirepas/WirepasTopology.js'

const SideMenu = styled.nav`
	width: 375px;
	position: absolute;
	right: 0;
	bottom: 0;
	height: calc(var(--menu-height) - 2px);
	color: #fff;
	background-color: var(--color-panel-bg);
	padding: 0.5rem;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	button {
		color: inherit;
	}
	.lucide {
		width: 22px;
		height: 22px;
	}
`

export const Dashboard = () => (
	<>
		<DeviceList />
		<DeviceLocations />
		<DeviceHistory />
		<WirepasTopology />
		<Settings />
		<SideMenu>
			<GitHubButton />
			<ZoomToWorldButton />
			<SettingsButton />
			<FavoritesButton />
		</SideMenu>
		<AppUpdateNotifier />
	</>
)
