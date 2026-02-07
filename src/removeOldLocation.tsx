import type { GeoLocation } from './DeviceType.ts'

/**
 * Remove outdated locations
 */
export const removeOldLocation = ({ ts }: GeoLocation): boolean =>
	(ts?.getTime() ?? 0) > Date.now() - 24 * 60 * 60 * 1000
