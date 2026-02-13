import { KinesisVideo, ListStreamsCommand } from '@aws-sdk/client-kinesis-video'
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts'
import type { AuthUser } from 'aws-amplify/auth'
import { fetchAuthSession } from 'aws-amplify/auth'
import { createContext, type ComponentChildren } from 'preact'
import { useContext, useEffect, useMemo, useState } from 'preact/hooks'
import type { InitAuthFn } from '../context/InitAuthFn.ts'

// Find a better way to reuse this type from AWS SDK without redefining it ourselves
export type AWSCredentials = {
	accessKeyId: string
	secretAccessKey: string
	sessionToken?: string
	expiration?: Date
}

export const AuthContext = createContext<{
	cognitoUser?: AuthUser
	isLoggedIn: boolean
	loading: boolean
	credentials?: AWSCredentials
}>({
	isLoggedIn: false,
	loading: false,
	credentials: undefined,
})

export const Provider = ({
	children,
	initAuth,
}: {
	children: ComponentChildren
	initAuth: InitAuthFn
}) => {
	const [cognitoUser, setCognitoUser] = useState<undefined | AuthUser>()
	const [initializing, setInitialized] = useState(true)
	const [credentials, setCredentials] = useState<AWSCredentials | undefined>(
		undefined,
	)

	const isLoggedIn = useMemo(() => cognitoUser !== undefined, [cognitoUser])

	useEffect(() => {
		initAuth()
			.then((maybeUser) => {
				if (maybeUser === null) return
				setCognitoUser(maybeUser)
			})
			.catch(console.error)
			.finally(() => setInitialized(false))
	}, [])

	useEffect(() => {
		if (initializing) return
		// Fetches credentials for authenticated users, or unauthenticated (guest)
		// role when not logged in (requires identityPoolId + allowGuestAccess in Amplify config)
		fetchAuthSession()
			.then((res) => setCredentials(res.credentials))
			.catch(console.error)
	}, [initializing])

	useEffect(() => {
		if (credentials === undefined) return

		const sts = new STSClient({
			region: REGION,
			credentials,
		})

		sts
			.send(new GetCallerIdentityCommand())
			.then((res) =>
				console.log('AWS credentials are valid, caller identity:', res),
			)
			.catch((err) => console.error('Error validating AWS credentials:', err))

		const kinesisVideo = new KinesisVideo({
			region: REGION,
			credentials,
		})

		kinesisVideo
			.send(new ListStreamsCommand())
			.then((res) =>
				console.log('AWS credentials are valid, Kinesis Video streams:', res),
			)
			.catch((err) =>
				console.error(
					'Error validating AWS credentials with Kinesis Video:',
					err,
				),
			)
	}, [credentials])

	return (
		<AuthContext.Provider
			value={{
				cognitoUser,
				isLoggedIn,
				loading: !initializing,
				credentials,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const Consumer = AuthContext.Consumer

export const useAuth = () => useContext(AuthContext)
