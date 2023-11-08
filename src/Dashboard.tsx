import styled from 'styled-components'
import { AppUpdateNotifier } from './AppUpdateNotifier.js'
import { DeviceList } from './DeviceList.js'
import { GitHubButton } from './GitHubButton.js'
import { Settings, SettingsButton } from './Settings.js'
import { DeviceHistory } from './chart/DeviceHistory.js'
import { DeviceLocations } from './map/DeviceLocations.js'
import { ZoomToWorldButton } from './map/ZoomToWorldButton.js'
import { useSettings } from './context/Settings.js'
import { Star, StarOff } from 'lucide-preact'
import { colors } from './colors.js'

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
	const {
		settings: { showFavorites },
	} = useSettings()
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
				{showFavorites && (
					<Star
						strokeWidth={2}
						class={'mx-2'}
						style={{ color: colors['nordic-fall'] }}
					/>
				)}
				{!showFavorites && (
					<StarOff
						strokeWidth={2}
						class={'mx-2'}
						style={{ color: colors['nordic-middle-grey'] }}
					/>
				)}
			</SideMenu>
			<AppUpdateNotifier />
		</>
	)
}
