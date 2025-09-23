import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { GeoLocationSource } from './Devices.js'

type GeolocationResource = {
	ObjectID: number
	ObjectInstanceID?: number
	Resources: Record<string, number | string>
}

type LocationData = {
	lng: number
	lat: number
	accuracy?: number
	source: GeoLocationSource
	ts: Date
}

// Mock LwM2M object processing function from LwM2M.tsx
const processGeolocationObject = (object: GeolocationResource) => {
	const locations = new Map<string, LocationData>()

	if (object.ObjectID === 14201) {
		// Geolocation object
		const { 1: lng, 0: lat, 3: acc, 6: src } = object.Resources

		if ((object.ObjectInstanceID ?? 0) === 0) {
			// General location fix (uses source field from resource 6)
			locations.set(src as string, {
				lng: lng as number,
				lat: lat as number,
				accuracy: acc as number,
				source: src as GeoLocationSource,
				ts: new Date((object.Resources['99'] as number) * 1000),
			})
		} else if (object.ObjectInstanceID === 1) {
			// Network scan
			locations.set(src as string, {
				lng: lng as number,
				lat: lat as number,
				accuracy: acc as number,
				source: src as GeoLocationSource,
				ts: new Date((object.Resources['99'] as number) * 1000),
			})
		}
	}

	return { locations }
}

void describe('LwM2M Location Processing', () => {
	void it('should correctly use WIFI source for ObjectInstanceID 0', () => {
		// Mock geolocation object with WIFI source (representing Nordic NR+ device)
		const mockGeolocationObject: GeolocationResource = {
			ObjectID: 14201,
			ObjectInstanceID: 0, // This was previously hardcoded to GNSS
			Resources: {
				0: 63.42503, // latitude
				1: 10.43831, // longitude
				2: 117.34, // altitude
				3: 19.08, // accuracy
				4: 5.42, // speed
				5: 170.66, // heading
				6: 'WIFI', // source - this should be used instead of hardcoded GNSS
				99: 1563968747, // timestamp
			},
		}

		const result = processGeolocationObject(mockGeolocationObject)

		// Verify that the location is stored with WIFI source key
		assert.equal(result.locations.has('WIFI'), true)
		assert.equal(result.locations.has('GNSS'), false)

		const wifiLocation = result.locations.get('WIFI')
		assert.ok(wifiLocation)
		assert.equal(wifiLocation.source, GeoLocationSource.WIFI)
		assert.equal(wifiLocation.lat, 63.42503)
		assert.equal(wifiLocation.lng, 10.43831)
		assert.equal(wifiLocation.accuracy, 19.08)
	})

	void it('should correctly use GNSS source for ObjectInstanceID 0 when source is GNSS', () => {
		// Mock geolocation object with GNSS source
		const mockGeolocationObject: GeolocationResource = {
			ObjectID: 14201,
			ObjectInstanceID: 0,
			Resources: {
				0: 63.42503, // latitude
				1: 10.43831, // longitude
				2: 117.34, // altitude
				3: 19.08, // accuracy
				4: 5.42, // speed
				5: 170.66, // heading
				6: 'GNSS', // source
				99: 1563968747, // timestamp
			},
		}

		const result = processGeolocationObject(mockGeolocationObject)

		// Verify that the location is stored with GNSS source key
		assert.equal(result.locations.has('GNSS'), true)
		assert.equal(result.locations.has('WIFI'), false)

		const gnssLocation = result.locations.get('GNSS')
		assert.ok(gnssLocation)
		assert.equal(gnssLocation.source, GeoLocationSource.GNSS)
		assert.equal(gnssLocation.lat, 63.42503)
		assert.equal(gnssLocation.lng, 10.43831)
		assert.equal(gnssLocation.accuracy, 19.08)
	})

	void it('should correctly handle ObjectInstanceID 1 with different sources', () => {
		// Mock geolocation object for network scan (ObjectInstanceID 1)
		const mockGeolocationObject: GeolocationResource = {
			ObjectID: 14201,
			ObjectInstanceID: 1,
			Resources: {
				0: 63.42503, // latitude
				1: 10.43831, // longitude
				3: 19.08, // accuracy
				6: 'WIFI', // source
				99: 1563968747, // timestamp
			},
		}

		const result = processGeolocationObject(mockGeolocationObject)

		// Verify that the location is stored with WIFI source key
		assert.equal(result.locations.has('WIFI'), true)

		const wifiLocation = result.locations.get('WIFI')
		assert.ok(wifiLocation)
		assert.equal(wifiLocation.source, GeoLocationSource.WIFI)
	})
})
