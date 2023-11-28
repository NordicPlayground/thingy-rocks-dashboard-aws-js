import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import os from 'node:os'
import { type NRPlusNetworkTopology, parseTopology } from './parseTopology.js'

void describe('topologyParser()', () => {
	void it('should parse a NR+ network topology in text form', () => {
		const expected: NRPlusNetworkTopology = {
			nodes: [
				{
					id: 38,
					title: 'Sink',
					sink: true,
				},
				{
					id: 41,
					title: 'Client',
					sink: false,
				},
				{
					id: 39,
					title: 'Relay',
					sink: false,
				},
				{
					id: 40,
					title: 'Client',
					sink: false,
				},
			],
			connections: [
				{
					from: 41,
					to: 38,
					distance: 5,
				},
				{
					from: 39,
					to: 38,
					distance: 3,
				},
				{
					from: 40,
					to: 39,
					distance: 1,
				},
			],
		}
		assert.deepEqual(
			parseTopology(
				[
					`38*:Sink`,
					`41:Client`,
					`39:Relay`,
					`40:Client`,
					`41----->38`,
					`39--->38`,
					`40->39`,
				].join(os.EOL),
			),
			expected,
		)
	})
})
