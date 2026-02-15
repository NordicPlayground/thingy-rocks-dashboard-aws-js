import {
	APIName,
	GetDataEndpointCommand,
	KinesisVideoClient,
} from '@aws-sdk/client-kinesis-video'
import {
	GetHLSStreamingSessionURLCommand,
	HLSDisplayFragmentTimestamp,
	HLSFragmentSelectorType,
	HLSPlaybackMode,
	KinesisVideoArchivedMediaClient,
} from '@aws-sdk/client-kinesis-video-archived-media'
import type { AWSCredentials } from '../context/Auth.tsx'

/**
 * Extract region from Kinesis Video Stream ARN.
 * Format: arn:aws:kinesisvideo:REGION:ACCOUNT:stream/STREAM_NAME/TIMESTAMP
 */
const regionFromStreamArn = (streamArn: string): string => {
	const match = /arn:aws:kinesisvideo:([a-z0-9-]+):/.exec(streamArn)
	return match?.[1] ?? REGION
}

/**
 * Fetch an HLS streaming session URL for playback of an AWS Kinesis Video Stream.
 *
 * @param streamArn - The ARN of the Kinesis Video stream
 * @param credentials - AWS credentials from Cognito
 * @param startTimestamp - Optional. When provided, starts playback from this timestamp (LIVE_REPLAY mode).
 *   When omitted, starts from the live edge (LIVE mode).
 * @returns HLS URL for the stream, or null if it could not be retrieved
 */
export const fetchKinesisHlsUrl = async (
	streamArn: string,
	credentials: AWSCredentials,
	startTimestamp?: Date,
): Promise<string | null> => {
	const region = regionFromStreamArn(streamArn)

	const kinesisVideoClient = new KinesisVideoClient({
		region,
		credentials,
	})

	const { DataEndpoint } = await kinesisVideoClient.send(
		new GetDataEndpointCommand({
			StreamARN: streamArn,
			APIName: APIName.GET_HLS_STREAMING_SESSION_URL,
		}),
	)

	if (DataEndpoint === undefined || DataEndpoint === '') {
		return null
	}

	const archivedMediaClient = new KinesisVideoArchivedMediaClient({
		region,
		endpoint: DataEndpoint,
		credentials,
	})

	const { HLSStreamingSessionURL } = await archivedMediaClient.send(
		new GetHLSStreamingSessionURLCommand({
			StreamARN: streamArn,
			PlaybackMode: startTimestamp
				? HLSPlaybackMode.LIVE_REPLAY
				: HLSPlaybackMode.LIVE,
			// Include fragment timestamps in the HLS playlist (EXT-X-PROGRAM-DATE-TIME)
			// so players can display accurate record timestamps
			DisplayFragmentTimestamp: HLSDisplayFragmentTimestamp.ALWAYS,
			// LIVE_REPLAY defaults to only 5 fragments; request up to 5000 so we can
			// buffer from start through to the live edge for seek-forward support
			...(startTimestamp && {
				MaxMediaPlaylistFragmentResults: 5000,
				HLSFragmentSelector: {
					FragmentSelectorType: HLSFragmentSelectorType.SERVER_TIMESTAMP,
					TimestampRange: {
						StartTimestamp: startTimestamp,
					},
				},
			}),
		}),
	)

	return HLSStreamingSessionURL ?? null
}
