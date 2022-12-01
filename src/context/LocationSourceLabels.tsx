import { GeoLocationSource } from './Devices'

// Uses nrfcloud.com wording
export const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.MULTI_CELL]: 'MCELL',
	[GeoLocationSource.SINGLE_CELL]: 'SCELL',
	[GeoLocationSource.WIFI]: 'WI-FI',
}
