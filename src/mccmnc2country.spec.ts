import { mccmnc2country } from './mccmnc2country'

describe('mccmnc2country()', () => {
	it('should return the two-letter ISO 3661 country code for a given MCC/MNC combination', () =>
		expect(mccmnc2country(26202)).toMatchObject({
			code: 'DE',
			name: 'Germany',
		}))
})
