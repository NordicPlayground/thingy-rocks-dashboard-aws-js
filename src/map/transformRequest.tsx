import { Signer } from '@aws-amplify/core'
import type { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity'
import type { RequestTransformFunction } from 'maplibre-gl'

export const region = COGNITO_IDENTITY_POOL_ID.split(':')[0] as string

export const transformRequest = (
	credentials: CognitoIdentityCredentials,
): RequestTransformFunction => {
	return (url: string, resourceType?: string) => {
		if (resourceType === 'Style' && !url.includes('://')) {
			url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`
		} else if (resourceType === 'Glyphs' && !url.includes('://')) {
			url = `https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${url}`
		}

		if (url.includes('amazonaws.com')) {
			// only sign AWS requests (with the signature as part of the query string)
			return {
				url: Signer.signUrl(url, {
					access_key: credentials.accessKeyId,
					secret_key: credentials.secretAccessKey,
					session_token: credentials.sessionToken,
				}),
			}
		}

		return { url }
	}
}
