import { CloseHistoryChartButton } from './CloseHistoryChartButton'
import { DeviceHistory } from './DeviceHistory'
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
				<CloseHistoryChartButton />
				<ZoomToWorldButton />
			</SideMenu>
			<DeviceList />
			<DeviceLocations />
			<DeviceHistory />
		</>
	)
}
