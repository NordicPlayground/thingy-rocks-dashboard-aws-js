import { fromEnv } from '@nordicsemiconductor/from-env'
import { render } from 'preact'
import { App } from './App'

const { websocketEndpoint } = fromEnv({
	websocketEndpoint: 'PUBLIC_WEBSOCKET_ENDPOINT',
})(import.meta.env as Record<string, any>)

console.debug('websocketEndpoint', websocketEndpoint)

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App websocketEndpoint={websocketEndpoint} />, root)
}
