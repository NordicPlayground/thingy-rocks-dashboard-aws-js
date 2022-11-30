import { render } from 'preact'
import { App } from './App'

console.debug('mapName', MAP_NAME)
console.debug(`identityPoolId`, COGNITO_IDENTITY_POOL_ID)
console.debug('websocketEndpoint', WEBSOCKET_ENDPOINT)

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
