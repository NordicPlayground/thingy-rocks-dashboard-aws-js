import type { GeoLocation } from './DeviceType.ts'

/**
 * Sort locations based on their age
 */
export const sortLocations = (
	{ ts: ts1 }: GeoLocation,
	{ ts: ts2 }: GeoLocation,
): number => (ts2?.getTime() ?? 0) - (ts1?.getTime() ?? 0)
