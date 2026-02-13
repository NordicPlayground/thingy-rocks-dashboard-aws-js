import {
	APIName,
	GetDataEndpointCommand,
	KinesisVideoClient,
} from '@aws-sdk/client-kinesis-video'
import {
	Format,
	GetImagesCommand,
	ImageSelectorType,
	KinesisVideoArchivedMediaClient,
} from '@aws-sdk/client-kinesis-video-archived-media'
import type { AuthHelper } from '../WithMapAuthHelper.tsx'

/**
 * Extract region from Kinesis Video Stream ARN.
 * Format: arn:aws:kinesisvideo:REGION:ACCOUNT:stream/STREAM_NAME/TIMESTAMP
 */
const regionFromStreamArn = (streamArn: string): string => {
	const match = /arn:aws:kinesisvideo:([a-z0-9-]+):/.exec(streamArn)
	return match?.[1] ?? REGION
}

/**
 * Fetch the latest still image from an AWS Kinesis Video Stream.
 * Requires the stream to have data retention enabled and recent media.
 *
 * @param streamArn - The ARN of the Kinesis Video stream
 * @param authHelper - Auth helper providing AWS credentials from Cognito
 * @returns Base64-encoded JPEG image data URL, or null if no image could be retrieved
 */
export const fetchLatestKinesisImage = async (
	streamArn: string,
	authHelper: AuthHelper,
): Promise<string | null> => {
	const region = regionFromStreamArn(streamArn)
	const credentials = authHelper.getCredentials()

	const kinesisVideoClient = new KinesisVideoClient({
		region,
		credentials: async () => credentials,
	})

	const { DataEndpoint } = await kinesisVideoClient.send(
		new GetDataEndpointCommand({
			StreamARN: streamArn,
			APIName: APIName.GET_IMAGES,
		}),
	)

	if (DataEndpoint === undefined || DataEndpoint === '') {
		return null
	}

	const archivedMediaClient = new KinesisVideoArchivedMediaClient({
		region,
		endpoint: DataEndpoint,
		credentials: async () => credentials,
	})

	const now = Date.now()
	const startTs = new Date(now - 10_000) // 10 seconds ago
	const endTs = new Date(now)

	const { Images } = await archivedMediaClient.send(
		new GetImagesCommand({
			StreamARN: streamArn,
			ImageSelectorType: ImageSelectorType.SERVER_TIMESTAMP,
			StartTimestamp: startTs,
			EndTimestamp: endTs,
			SamplingInterval: 10_000, // 1 image in the range
			Format: Format.JPEG,
			FormatConfig: { JPEGQuality: '80' },
			MaxResults: 1,
		}),
	)

	const image = Images?.find(
		(img) => img.ImageContent !== undefined && !img.Error,
	)
	if (image?.ImageContent === undefined) {
		return null
	}

	return `data:image/jpeg;base64,${image.ImageContent}`
}
