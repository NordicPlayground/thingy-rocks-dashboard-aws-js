import { Github } from 'lucide-preact'
import pjson from '../package.json'

export const GitHubButton = () => (
	<a class="btn btn-link" href={pjson.homepage} target="_blank">
		<Github strokeWidth={2} />
	</a>
)
