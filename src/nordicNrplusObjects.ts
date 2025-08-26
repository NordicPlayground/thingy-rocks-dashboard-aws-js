import type { LwM2MObject } from '@hello.nrfcloud.com/proto-map/lwm2m'

/**
 * Network Neighbor (14502)
 *
 * This LwM2M Object describes neighboring devices.
 */
export type NetworkNeighbor_14502 = LwM2MObject<{
	ObjectID: 14502
	ObjectVersion: '1.0'
	Resources: {
		/**
		 * Neighbor ID
		 *
		 * This identifier uniquely identifies each neighbor device in the network.
		 */
		0: number // 1..4294967293
		/**
		 * Radio Signal Strength
		 *
		 * Indicates the average value of the received signal strength indication from the neighbor device.
		 */
		1?: number // -140..-1 dBm
		/**
		 * Timestamp
		 *
		 * The timestamp of when the neighbor information was reported.
		 */
		99: number
	}
}>

/**
 * DECT NR+ Connection Profile (14503)
 *
 * Connection details of a device connected to a DECT NR+ network.
 */
export type DECTNRPlusConnectionProfile_14503 = LwM2MObject<{
	ObjectID: 14503
	ObjectVersion: '1.0'
	Resources: {
		/**
		 * Long RD ID
		 *
		 * This identifier uniquely identifies this radio device in the DECT NR+ network.
		 */
		0: number // 1..4294967293
		/**
		 * Network ID
		 *
		 * This identifier uniquely identifies the DECT NR+ network that this radio device is in.
		 */
		1: number // 1..4294967293
		/**
		 * Operational Mode
		 *
		 * Operational mode of this radio device. Examples: FT, PT.
		 */
		2: string
		/**
		 * Timestamp
		 *
		 * The timestamp of when the DECT NR+ connection profile was last reported.
		 */
		99: number
	}
}>