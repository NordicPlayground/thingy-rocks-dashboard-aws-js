import { Github } from 'lucide-preact'
import styled from 'styled-components'
import { DeviceHistory } from './chart/DeviceHistory'
import { DeviceList } from './DeviceList'
import { DeviceLocations } from './map/DeviceLocations'
import { ZoomToWorldButton } from './map/ZoomToWorldButton'
import { Settings, SettingsButton } from './Settings'

const SideMenu = styled.nav`
	position: absolute;
	right: 1rem;
	bottom: 2rem;
	color: #fff;
	button {
		color: inherit;
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
				<a href={HOMEPAGE} class="btn btn-link text-white" target={'_blank'}>
					<Github strokeWidth={2} size={32} />
				</a>
				<ZoomToWorldButton />
				<SettingsButton />
			</SideMenu>
		</>
	)
}
