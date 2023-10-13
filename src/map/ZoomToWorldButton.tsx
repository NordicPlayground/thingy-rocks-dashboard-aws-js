import { Globe } from 'lucide-preact'
import { useMap } from '../context/Map.js'

/**
 * Show the entire world map
 */
export const ZoomToWorldButton = () => {
	const map = useMap()
	return (
		<button
			type={'button'}
			class="btn btn-link"
			onClick={() => {
				map.showWorld()
			}}
		>
			<Globe strokeWidth={2} />
		</button>
	)
}
