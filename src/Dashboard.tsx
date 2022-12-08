import { DeviceHistory } from './chart/DeviceHistory'
import { DeviceList } from './DeviceList'
import { DeviceLocations } from './map/DeviceLocations'
import { ZoomToWorldButton } from './map/ZoomToWorldButton'
import { SideMenu } from './SideMenu'

export const Dashboard = () => {
	return (
		<>
			<SideMenu>
				<ZoomToWorldButton />
			</SideMenu>
			<DeviceList />
			<DeviceLocations />
			<DeviceHistory />
		</>
	)
}
