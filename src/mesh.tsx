import { formatDistanceToNow } from 'date-fns'
import { render } from 'preact'
import { MeshVisualizer } from './MeshVisualizer'

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
	render(<MeshVisualizer />, root)
}
