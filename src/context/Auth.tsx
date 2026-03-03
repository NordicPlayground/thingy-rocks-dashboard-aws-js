import type { AuthUser } from 'aws-amplify/auth'
import {
	fetchAuthSession,
	getCurrentUser,
	signInWithRedirect,
	signOut,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
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
	signIn: () => Promise<void>
	signOut: () => Promise<void>
}>({
	isLoggedIn: false,
	loading: false,
	credentials: undefined,
	signIn: async () => {},
	signOut: async () => {},
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

	const signIn = async () => {
		await signInWithRedirect()
	}

	const handleSignOut = async () => {
		await signOut()
		setCognitoUser(undefined)
		setCredentials(undefined)
	}

	useEffect(() => {
		const isOAuthCallback =
			typeof window !== 'undefined' &&
			window.location.search.includes('code=') &&
			window.location.search.includes('state=')

		const runInitAuth = () => {
			initAuth()
				.then((maybeUser) => {
					if (maybeUser === null) return
					setCognitoUser(maybeUser)
				})
				.catch(console.error)
				.finally(() => setInitialized(false))
		}

		if (isOAuthCallback) {
			// OAuth callback: Amplify's enable-oauth-listener handles the exchange.
			// Give it time to complete before checking auth state.
			const t = setTimeout(runInitAuth, 300)
			return () => clearTimeout(t)
		}

		runInitAuth()
		return undefined
	}, [])

	useEffect(() => {
		const hubListener = Hub.listen('auth', ({ payload }) => {
			if (
				payload.event === 'signedIn' ||
				payload.event === 'signInWithRedirect'
			) {
				getCurrentUser().then(setCognitoUser).catch(console.error)
			}
		})
		return () => hubListener()
	}, [])

	useEffect(() => {
		if (initializing) return
		let refreshTimer: ReturnType<typeof setTimeout> | undefined

		const refresh = (forceRefresh = false) => {
			fetchAuthSession(forceRefresh ? { forceRefresh: true } : undefined)
				.then((res) => {
					setCredentials(res.credentials)
					// Schedule next refresh before the credentials expire
					const expiration = res.credentials?.expiration
					if (expiration !== undefined) {
						const msUntilExpiry = expiration.getTime() - Date.now()
						// Refresh 5 minutes before expiry (or immediately if already close)
						const refreshIn = Math.max(msUntilExpiry - 5 * 60_000, 0)
						refreshTimer = setTimeout(() => refresh(true), refreshIn)
					}
				})
				.catch(console.error)
		}

		refresh()
		return () => clearTimeout(refreshTimer)
	}, [initializing])

	return (
		<AuthContext.Provider
			value={{
				cognitoUser,
				isLoggedIn,
				loading: initializing,
				credentials,
				signIn,
				signOut: handleSignOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const Consumer = AuthContext.Consumer

export const useAuth = () => useContext(AuthContext)
