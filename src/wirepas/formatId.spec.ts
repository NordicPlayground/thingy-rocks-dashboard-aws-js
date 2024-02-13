import assert from 'node:assert/strict'
import { it, describe } from 'node:test'
import { formatId } from './formatId.js'
void describe('formatId()', () => {
	for (const [example, expected] of [
		['1', '1'],
		['12', '12'],
		['12345', `…2345`],
		['12345678', `…5678`],
		['123456789', `…6789`],
	] as [string, string][]) {
		void it(`should format ${example} as ${expected}`, () =>
			assert.equal(formatId(example), expected))
	}
})
