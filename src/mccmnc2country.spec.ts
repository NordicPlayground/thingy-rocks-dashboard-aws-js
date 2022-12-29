import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mccmnc2country } from './mccmnc2country'

describe('mccmnc2country()', () => {
	it('should return the two-letter ISO 3661 country code for a given MCC/MNC combination', () =>
		assert.deepEqual(mccmnc2country(26202), {
			code: 'DE',
			name: 'Germany',
		}))
})
