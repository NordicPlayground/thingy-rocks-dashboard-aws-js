import { rgbToHex } from './rgbToHex'

describe('rgbToHex()', () => {
	it('should convert hex to RGB', () => {
		expect(rgbToHex([255, 255, 255])).toEqual('ffffff')
		expect(rgbToHex([222, 130, 59])).toEqual('de823b')
	})
})
