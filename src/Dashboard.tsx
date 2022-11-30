import { DeviceList } from './DeviceList'
import { Footer } from './Footer'
import { Logo } from './Logo'
import { DeviceLocations } from './map/DeviceLocations'

export const Dashboard = () => {
	return (
		<>
			<Logo />
			<DeviceList />
			<Footer />
			<DeviceLocations />
		</>
	)
}
