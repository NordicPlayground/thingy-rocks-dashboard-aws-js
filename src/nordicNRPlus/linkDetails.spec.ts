import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { addressDetails, linkDetails, packetLoss } from './linkDetails.ts'

void describe('linkDetails()', () => {
	void it('should describe all available values', () => {
		assert.equal(
			linkDetails({
				neighborId: 1,
				ts: 0,
				txPower: 0,
				neighborTxPower: 10,
				rxMcs: 4,
				txAttempts: 200,
				harqNack: 10,
				missedBeacons: 1,
				lastSeen: 125,
			}),
			[
				'TX power: 0 dBm (neighbor: 10 dBm)',
				'RX MCS: 4',
				'Packet loss: 5 % (10 NACKs of 200 attempts)',
				'Missed beacons: 1',
				'Last heard: 2 min ago',
			].join('\n'),
		)
	})

	void it('should skip values that are not available', () => {
		assert.equal(linkDetails({ neighborId: 1, ts: 0 }), '')
	})

	void it('should not report a packet loss without TX attempts', () => {
		assert.equal(packetLoss({ txAttempts: 0, harqNack: 0 }), undefined)
		assert.equal(packetLoss({ txAttempts: undefined, harqNack: 3 }), undefined)
	})

	void it('should not report more than 100 % packet loss', () => {
		// The counters come from different windows and can disagree
		assert.equal(packetLoss({ txAttempts: 10, harqNack: 30 }), 100)
	})

	void it('should mark a saturated last-seen value', () => {
		assert.equal(
			linkDetails({ neighborId: 1, ts: 0, lastSeen: 65535 }),
			'Last heard: more than 18 hours ago',
		)
	})
})

void describe('addressDetails()', () => {
	void it('should list the addresses that exist', () => {
		assert.equal(
			addressDetails({ globalIpv6: '2001:db8::1', linkLocalIpv6: 'fe80::1' }),
			'IPv6: 2001:db8::1\nLink-local: fe80::1',
		)
		assert.equal(
			addressDetails({ linkLocalIpv6: 'fe80::1' }),
			'Link-local: fe80::1',
		)
		assert.equal(addressDetails(undefined), '')
	})
})
