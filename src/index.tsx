import { render } from 'preact'
import { App } from './App'
import './sentry'

console.debug('mapName', MAP_NAME)
console.debug(`identityPoolId`, COGNITO_IDENTITY_POOL_ID)
console.debug('websocketEndpoint', WEBSOCKET_ENDPOINT)
console.debug('sentryDSN', SENTRY_DSN)

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
