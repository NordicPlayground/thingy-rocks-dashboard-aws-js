import type { RGB } from './rgbToHex'

export const hexToRGB = (hex: string): RGB => {
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16),
	]
}
