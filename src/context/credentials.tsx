import {
	CognitoIdentityCredentials,
	fromCognitoIdentityPool,
} from '@aws-sdk/credential-provider-cognito-identity'
import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'

export const CredentialsContext = createContext<{
	credentials?: CognitoIdentityCredentials
}>({})

const region = COGNITO_IDENTITY_POOL_ID.split(':')[0] as string

console.debug(`COGNITO_IDENTITY_POOL_ID`, COGNITO_IDENTITY_POOL_ID)

export const Provider = ({ children }: { children: ComponentChildren }) => {
	const [credentials, setCredentials] = useState<CognitoIdentityCredentials>()

	const refreshCredentials = () =>
		fromCognitoIdentityPool({
			identityPoolId: COGNITO_IDENTITY_POOL_ID,
			client: new CognitoIdentityClient({ region }),
		})()
			.then((credentials) => setCredentials(credentials))
			.catch(console.error)

	// Create credentials for unauthenticated users
	useEffect(() => {
		refreshCredentials()
	}, [])

	// Refresh credentials
	useEffect(() => {
		if (credentials === undefined) return

		const t = setTimeout(() => {
			refreshCredentials()
		}, (credentials.expiration as Date).getTime() - new Date().getTime())

		return () => {
			clearTimeout(t)
		}
	}, [credentials])

	if (credentials === undefined)
		return (
			<CredentialsContext.Provider value={{}}>
				{children}
			</CredentialsContext.Provider>
		)

	return (
		<CredentialsContext.Provider
			value={{
				credentials,
			}}
		>
			{children}
		</CredentialsContext.Provider>
	)
}

export const Consumer = CredentialsContext.Consumer

export const useCredentials = () => useContext(CredentialsContext)
