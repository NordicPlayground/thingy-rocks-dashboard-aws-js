import { formatDistanceToNow } from 'date-fns'
import { render } from 'preact'
import { App } from './App.js'
import './sentry.js'

console.debug('mapApiKey', MAP_API_KEY)
console.debug(`identityPoolId`, COGNITO_IDENTITY_POOL_ID)
console.debug('websocketEndpoint', WEBSOCKET_ENDPOINT)
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
