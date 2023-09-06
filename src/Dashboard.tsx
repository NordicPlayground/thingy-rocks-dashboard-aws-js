import styled from 'styled-components'
import { AppUpdateNotifier } from './AppUpdateNotifier.js'
import { DeviceList } from './DeviceList.js'
import { GitHubButton } from './GitHubButton.js'
import { Settings, SettingsButton } from './Settings.js'
import { DeviceHistory } from './chart/DeviceHistory.js'
import { DeviceLocations } from './map/DeviceLocations.js'
import { ZoomToWorldButton } from './map/ZoomToWorldButton.js'

const SideMenu = styled.nav`
	position: absolute;
	right: 1rem;
	bottom: 1rem;
	color: #fff;
	button {
		color: inherit;
	}
	.lucide {
		width: 22px;
		height: 22px;
	}
`

export const Dashboard = () => {
	return (
		<>
			<DeviceList />
			<DeviceLocations />
			<DeviceHistory />
			<Settings />
			<SideMenu>
				<GitHubButton />
				<ZoomToWorldButton />
				<SettingsButton />
			</SideMenu>
			<AppUpdateNotifier />
		</>
	)
}
