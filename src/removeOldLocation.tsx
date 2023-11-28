import { type GeoLocation } from './context/Devices.js'

/**
 * Remove outdated locations
 */
export const removeOldLocation = ({ ts }: GeoLocation): boolean =>
	(ts?.getTime() ?? 0) > Date.now() - 24 * 60 * 60 * 1000
