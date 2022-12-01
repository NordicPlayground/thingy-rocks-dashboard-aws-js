import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'
import { render } from 'preact'
import { App } from './App'

console.debug('mapName', MAP_NAME)
console.debug(`identityPoolId`, COGNITO_IDENTITY_POOL_ID)
console.debug('websocketEndpoint', WEBSOCKET_ENDPOINT)
console.debug('sentryDSN', SENTRY_DSN)

if (SENTRY_DSN !== undefined && import.meta.env.PROD) {
	Sentry.init({
		dsn: SENTRY_DSN,
		integrations: [new BrowserTracing()],
		tracesSampleRate: 0.05,
	})
}

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
