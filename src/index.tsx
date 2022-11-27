import { render } from 'preact'
import { App } from './App'

const root = document.getElementById('root')

if (root === null) {
	console.error(`Could not find root element!`)
} else {
	render(<App />, root)
}
