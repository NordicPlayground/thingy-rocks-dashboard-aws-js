import { DeviceList } from './DeviceList'
import { Footer } from './Footer'
import { Logo } from './Logo'
import { Map } from './map/Map'

export const Dashboard = () => {
	return (
		<>
			<Logo />
			<DeviceList />
			<Footer />
			<Map />
		</>
	)
}
