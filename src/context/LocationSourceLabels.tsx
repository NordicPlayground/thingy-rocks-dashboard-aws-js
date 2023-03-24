import { GeoLocationSource } from './Devices'

// Uses nrfcloud.com wording
export const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.singleCell]: 'SCELL',
	[GeoLocationSource.network]: 'Network',
	[GeoLocationSource.fixed]: 'Fixed',
}
