import { DeviceChart } from './DeviceChart'
import { DeviceList } from './DeviceList'
import { Logo } from './Logo'
import { DeviceLocations } from './map/DeviceLocations'
import { ZoomToWorldButton } from './map/ZoomToWorldButton'
import { SideMenu } from './SideMenu'

export const Dashboard = () => {
	return (
		<>
			<Logo />
			<SideMenu>
				<ZoomToWorldButton />
			</SideMenu>
			<DeviceList />
			<DeviceLocations />
			<DeviceChart />
		</>
	)
}
