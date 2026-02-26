import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb'
import type { AWSCredentials } from '../../context/Auth.tsx'

const regionFromStreamArn = (streamArn: string): string => {
	const match = /arn:aws:kinesisvideo:([a-z0-9-]+):/.exec(streamArn)
	return match?.[1] ?? 'eu-central-1'
}

/**
 * Extract the port from a Kinesis Video Stream ARN.
 * Stream names follow the pattern video-streaming-video-{port} (e.g. video-streaming-video-5000).
 * Format: arn:aws:kinesisvideo:REGION:ACCOUNT:stream/STREAM_NAME/TIMESTAMP
 */
export const portFromStreamArn = (streamArn: string): number | null => {
	const streamMatch = /stream\/([^/]+)\//.exec(streamArn)
	const streamName = streamMatch?.[1]
	if (streamName === undefined) return null
	const portStr = streamName.split('-').pop()
	if (portStr === undefined) return null
	const port = parseInt(portStr, 10)
	return Number.isNaN(port) ? null : port
}

export type StreamStatus = 'active' | 'inactive' | null

/**
 * Fetch the stream status from DynamoDB StreamMetadata table.
 * Returns 'active' or 'inactive' if found, null if not found or on error.
 */
export const fetchStreamStatus = async (
	streamArn: string,
	credentials: AWSCredentials,
): Promise<StreamStatus> => {
	const port = portFromStreamArn(streamArn)
	if (port === null) return null

	const region = regionFromStreamArn(streamArn)
	const client = new DynamoDBClient({ region, credentials })

	try {
		const { Item } = await client.send(
			new GetItemCommand({
				TableName: STREAM_METADATA_TABLE,
				Key: {
					port: { N: String(port) },
				},
				ProjectionExpression: '#s',
				ExpressionAttributeNames: { '#s': 'status' },
			}),
		)

		const status = Item?.status?.S
		if (status === 'active' || status === 'inactive') {
			return status
		}
		return null
	} catch {
		return null
	}
}
