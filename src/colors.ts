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
} as const

// Source: https://coolors.co/palette/22577a-38a3a5-57cc99-80ed99-c7f9cc
export const locationSourceColors = {
	[GeoLocationSource.GNSS]: '#C7F9CC',
	[GeoLocationSource.network]: '#57CC99',
	[GeoLocationSource.fixed]: '#22577A',
	[GeoLocationSource.singleCell]: '#38A3A5',
} as const

export const wifiColor = '#80ED99'
