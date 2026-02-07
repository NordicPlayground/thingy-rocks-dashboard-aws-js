import { GeoLocationSource } from '../DeviceType.ts'

// Uses nrfcloud.com wording
export const LocationSourceLabels = {
	[GeoLocationSource.GNSS]: 'GNSS',
	[GeoLocationSource.WIFI]: 'Wi-Fi',
	[GeoLocationSource.SCELL]: 'single-cell',
	[GeoLocationSource.MCELL]: 'multi-cell',
	[GeoLocationSource.LPL]: 'LTE Precision Location',
	[GeoLocationSource.fixed]: 'Fixed Location',
}
