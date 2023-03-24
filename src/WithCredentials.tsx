import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import {
	fromCognitoIdentityPool,
	type CognitoIdentityCredentials,
} from '@aws-sdk/credential-provider-cognito-identity'
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export const WithCredentials = ({
	children,
}: {
	children: (credentials: CognitoIdentityCredentials) => ComponentChildren
}) => {
	const [credentials, setCredentials] = useState<CognitoIdentityCredentials>()

	const refreshCredentials = async () =>
		fromCognitoIdentityPool({
			identityPoolId: COGNITO_IDENTITY_POOL_ID,
			client: new CognitoIdentityClient({ region: REGION }),
		})()
			.then((credentials) => setCredentials(credentials))
			.catch(console.error)

	// Create credentials for unauthenticated users
	useEffect(() => {
		refreshCredentials().catch(console.error)
	}, [])

	// Refresh credentials
	useEffect(() => {
		if (credentials === undefined) return

		const t = setTimeout(() => {
			refreshCredentials().catch(console.error)
		}, (credentials.expiration as Date).getTime() - new Date().getTime())

		return () => {
			clearTimeout(t)
		}
	}, [credentials])

	if (credentials === undefined) return null

	return <>{children(credentials)}</>
}
