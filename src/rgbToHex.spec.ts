import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { rgbToHex } from './rgbToHex'

describe('rgbToHex()', () => {
	it('should convert hex to RGB', () => {
		assert.deepEqual(rgbToHex([255, 255, 255]), 'ffffff')
		assert.deepEqual(rgbToHex([222, 130, 59]), 'de823b')
	})
})
