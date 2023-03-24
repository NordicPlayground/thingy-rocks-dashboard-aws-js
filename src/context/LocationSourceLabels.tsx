import { GeoLocationSource } from './Devices'

// Uses nrfcloud.com wording
export const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.network]: 'Network',
	[GeoLocationSource.fixed]: 'Fixed',
}
