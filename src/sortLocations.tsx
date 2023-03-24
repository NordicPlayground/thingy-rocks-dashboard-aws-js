import { GeoLocationSource, type GeoLocation } from './context/Devices'

const weighSource = (source: GeoLocationSource): number => {
	switch (source) {
		case GeoLocationSource.GNSS:
			return 1
		case GeoLocationSource.network:
			return 2
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
