import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hexToRGB } from './hexToRGB'

describe('hexToRGB()', () => {
	it('should convert hex to RGB', () => {
		assert.deepEqual(hexToRGB('#ffffff'), [255, 255, 255])
		assert.deepEqual(hexToRGB('#de823b'), [222, 130, 59])
	})
})
