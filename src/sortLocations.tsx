import { GeoLocation, GeoLocationSource } from './context/Devices'

const weighSource = (source: GeoLocationSource): number => {
	switch (source) {
		case GeoLocationSource.GNSS:
			return 1
		case GeoLocationSource.WIFI:
			return 2
		case GeoLocationSource.MULTI_CELL:
			return 3
		case GeoLocationSource.SINGLE_CELL:
			return 4
		default:
			return Number.MAX_SAFE_INTEGER
	}
}

/**
 * Sort locations based on their "weight", more precise is better
 */
export const sortLocations = (
	{ source: source1 }: GeoLocation,
	{ source: source2 }: GeoLocation,
): number => weighSource(source1) - weighSource(source2)
