import { DeviceChart } from './DeviceChart'
import { DeviceList } from './DeviceList'
import { Logo } from './Logo'
import { DeviceLocations } from './map/DeviceLocations'

export const Dashboard = () => {
	return (
		<>
			<Logo />
			<DeviceList />
			<DeviceLocations />
			<DeviceChart />
		</>
	)
}
