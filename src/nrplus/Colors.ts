export const Colors = {
	connection: '#d1203a',
	helpers: '#ff61dd88',
	forces: '#5f9efb',
	cellular: '#f48120',
	text: '#333333',
} as const
export type Colors = (typeof Colors)[keyof typeof Colors]
