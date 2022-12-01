import { GeoLocationSource } from './context/Devices'

export const colors = {
	/* Nordic Style Guide: Primary colors */
	'nordic-blue': '#00a9ce',
	'nordic-sky': '#6ad1e3',
	'nordic-blueslate': '#0032a0',
	'nordic-lake': '#0077c8',

	/* Nordic Style Guide: Supporting colors */
	'nordic-grass': '#cedd50' /* nRF51 Series */,
	'nordic-sun': '#f4cb43' /* nRF52 Series */,
	'nordic-fall': '#de823b' /* nRF91 Series */,
	'nordic-power': '#8bc058' /* nPM Family   */,
	'nordic-red': '#d1314f' /* nRF53 Series */,
	'nordic-pink': '#c6007e' /* nRF21 Series */,

	/* Nordic Style Guide: Neutral colors */
	'nordic-light-grey': '#d9e1e2',
	'nordic-middle-grey': '#768692',
	'nordic-dark-grey': '#333f48',

	/* 12-bit rainbow palette https://iamkate.com/data/12-bit-rainbow/ */
	'rainbow-1': '#881177',
	'rainbow-2': '#aa3355',
	'rainbow-3': '#cc6666',
	'rainbow-4': '#ee9944',
	'rainbow-5': '#eedd00',
	'rainbow-6': '#99dd55',
	'rainbow-7': '#44dd88',
	'rainbow-8': '#22ccbb',
	'rainbow-9': '#00bbcc',
	'rainbow-10': '#0099cc',
	'rainbow-11': '#3366bb',
	'rainbow-12': '#663399',
} as const

export const locationSourceColors = {
	[GeoLocationSource.GNSS]: colors['rainbow-8'],
	[GeoLocationSource.SINGLE_CELL]: colors['rainbow-4'],
	[GeoLocationSource.MULTI_CELL]: colors['rainbow-5'],
	[GeoLocationSource.WIFI]: colors['rainbow-2'],
} as const
