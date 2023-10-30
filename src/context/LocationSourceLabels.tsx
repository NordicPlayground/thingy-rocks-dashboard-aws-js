import { GeoLocationSource } from './Devices.js'

// Uses nrfcloud.com wording
export const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.WIFI]: 'Wi-Fi',
	[GeoLocationSource.SCELL]: 'single-cell',
	[GeoLocationSource.MCELL]: 'multi-cell',
	[GeoLocationSource.fixed]: 'Fixed Location',
}
