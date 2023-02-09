export type RGB = [R: number, G: number, B: number]

export const rgbToHex = (rgb: RGB): string =>
	rgb.map((n) => n.toString(16).padStart(2, '0')).join('')
