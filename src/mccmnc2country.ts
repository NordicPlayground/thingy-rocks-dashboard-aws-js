import { mcc2iso } from './mcc2iso.js'

/**
 * returns the two-letter ISO 3661 country code for a given MCC/MNC combination
 */
export const mccmnc2country = (
	mccmnc: number,
): { code: string; name: string } | undefined => {
	const match = mcc2iso[mccmnc.toString().slice(0, 3)]
	if (match === undefined) return undefined
	return {
		code: match.alpha2,
		name: match.name,
	}
}
