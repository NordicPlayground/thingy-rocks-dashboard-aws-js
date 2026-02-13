import { Amplify } from 'aws-amplify'
import 'aws-amplify/auth/enable-oauth-listener'
import { formatDistanceToNow } from 'date-fns'
import { render } from 'preact'
import { App } from './App.js'
import './sentry.js'

const redirectUrl = document.location.protocol + '//' + document.location.host

// Configure Amplify before any auth-dependent code runs (required for OAuth callback handling)
Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: COGNITO_USER_POOL_CLIENT_ID,
			userPoolId: COGNITO_USER_POOL_URL.split('/')[3]!,
			identityPoolId: COGNITO_IDENTITY_POOL_ID,
			allowGuestAccess: true,
			loginWith: {
				email: true,
				oauth: {
					domain: COGNITO_DOMAIN_URL.replace(/^https?:\/\//, ''),
					scopes: ['email', 'profile', 'openid'],
					redirectSignIn: [redirectUrl],
					redirectSignOut: [redirectUrl],
					responseType: 'code' as const,
				},
			},
		},
	},
})

console.debug('mapApiKey', MAP_API_KEY)
console.debug('Cognito User Pool URL', COGNITO_USER_POOL_URL)
console.debug('Cognito User Pool Client ID', COGNITO_USER_POOL_CLIENT_ID)
console.debug('Cognito Identity Pool ID', COGNITO_IDENTITY_POOL_ID)
console.debug('Stream Metadata Table', STREAM_METADATA_TABLE)
console.debug('websocketEndpoint', WEBSOCKET_ENDPOINT)
console.debug('region', REGION)
console.debug('sentryDSN', SENTRY_DSN)
console.debug('version', VERSION)
console.debug(
	'build time',
	BUILD_TIME,
	formatDistanceToNow(new Date(BUILD_TIME), {
		addSuffix: true,
	}),
)

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
