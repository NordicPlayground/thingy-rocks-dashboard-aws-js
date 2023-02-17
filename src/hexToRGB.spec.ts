import { hexToRGB } from './hexToRGB'

describe('hexToRGB()', () => {
	it('should convert hex to RGB', () => {
		expect(hexToRGB('#ffffff')).toEqual([255, 255, 255])
		expect(hexToRGB('#de823b')).toEqual([222, 130, 59])
	})
})
