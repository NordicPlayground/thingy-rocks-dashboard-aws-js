import {
	APIName,
	GetDataEndpointCommand,
	KinesisVideoClient,
} from '@aws-sdk/client-kinesis-video'
import {
	Format,
	FragmentSelectorType,
	GetImagesCommand,
	ImageSelectorType,
	KinesisVideoArchivedMediaClient,
	ListFragmentsCommand,
} from '@aws-sdk/client-kinesis-video-archived-media'
import type { AWSCredentials } from '../../context/Auth.tsx'

/**
 * Extract region from Kinesis Video Stream ARN.
 * Format: arn:aws:kinesisvideo:REGION:ACCOUNT:stream/STREAM_NAME/TIMESTAMP
 */
const regionFromStreamArn = (streamArn: string): string => {
	const match = /arn:aws:kinesisvideo:([a-z0-9-]+):/.exec(streamArn)
	return match?.[1] ?? REGION
}

export type FetchLatestKinesisImageResult = {
	imageUrl: string
	startTimestamp: Date
}

/**
 * Fetch the latest still image from an AWS Kinesis Video Stream.
 * Requires the stream to have data retention enabled and recent media.
 *
 * @param streamArn - The ARN of the Kinesis Video stream
 * @param credentials - Auth helper providing AWS credentials from Cognito
 * @returns Image data URL and start timestamp, or null if no image could be retrieved
 */
export const fetchLatestKinesisImage = async (
	streamArn: string,
	credentials: AWSCredentials,
): Promise<FetchLatestKinesisImageResult | null> => {
	const region = regionFromStreamArn(streamArn)

	console.log({
		region,
		credentials,
	})

	const kinesisVideoClient = new KinesisVideoClient({
		region,
		credentials,
	})

	const { DataEndpoint: listEndpoint } = await kinesisVideoClient.send(
		new GetDataEndpointCommand({
			StreamARN: streamArn,
			APIName: APIName.LIST_FRAGMENTS,
		}),
	)

	if (listEndpoint === undefined || listEndpoint === '') {
		return null
	}

	const listMediaClient = new KinesisVideoArchivedMediaClient({
		region,
		endpoint: listEndpoint,
		credentials,
	})

	// Query the latest available fragment, searching backwards in 1-minute windows
	// until we find fragments or the start timestamp is older than 24 hours
	const listNow = Date.now()
	const twentyFourHoursAgo = listNow - 24 * 60 * 60 * 1000
	const oneMinute = 1 * 60 * 1000

	let listEndTs = listNow
	let latestFragment: { ServerTimestamp?: Date } | null = null
	let listStartTs: number

	do {
		listStartTs = listEndTs - oneMinute
		if (listStartTs >= twentyFourHoursAgo) {
			const { Fragments } = await listMediaClient.send(
				new ListFragmentsCommand({
					StreamARN: streamArn,
					FragmentSelector: {
						FragmentSelectorType: FragmentSelectorType.SERVER_TIMESTAMP,
						TimestampRange: {
							StartTimestamp: new Date(listStartTs),
							EndTimestamp: new Date(listEndTs),
						},
					},
					MaxResults: 100,
				}),
			)

			if ((Fragments?.length ?? 0) > 0) {
				latestFragment = Fragments!.reduce((latest, f) =>
					(f.ServerTimestamp?.getTime() ?? 0) >
					(latest.ServerTimestamp?.getTime() ?? 0)
						? f
						: latest,
				)
			} else {
				listEndTs = listStartTs
			}
		}
	} while (!latestFragment && listStartTs >= twentyFourHoursAgo)

	if (!latestFragment?.ServerTimestamp) {
		return null
	}

	const fragmentTime = latestFragment.ServerTimestamp.getTime()
	const startTs = new Date(fragmentTime - 5_000) // 5 seconds before fragment
	const endTs = new Date(fragmentTime + 5_000) // 5 seconds after fragment

	const { DataEndpoint: imagesEndpoint } = await kinesisVideoClient.send(
		new GetDataEndpointCommand({
			StreamARN: streamArn,
			APIName: APIName.GET_IMAGES,
		}),
	)

	if (imagesEndpoint === undefined || imagesEndpoint === '') {
		return null
	}

	const imagesMediaClient = new KinesisVideoArchivedMediaClient({
		region,
		endpoint: imagesEndpoint,
		credentials,
	})

	const { Images } = await imagesMediaClient.send(
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

	return {
		imageUrl: `data:image/jpeg;base64,${image.ImageContent}`,
		startTimestamp: latestFragment.ServerTimestamp,
	}
}
