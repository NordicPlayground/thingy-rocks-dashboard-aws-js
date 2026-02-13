import type { AuthUser } from 'aws-amplify/auth'
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'

export const getCurrentCognitoUser = async (): Promise<AuthUser | null> => {
	try {
		const user = await getCurrentUser()

		const session = await fetchAuthSession()

		const idToken = session.tokens?.idToken?.toString()

		if (idToken === undefined) return null

		return user
	} catch (err) {
		if ((err as Error).name === 'UserUnAuthenticatedException') return null
		console.warn(`[getCurrentCognitoUser]`, err)
		return null
	}
}
