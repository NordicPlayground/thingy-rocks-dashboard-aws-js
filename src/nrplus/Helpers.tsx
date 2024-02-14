import { Colors } from './Colors.js'

export const Helpers = ({
	width,
	height,
}: {
	width: number
	height: number
}) => (
	<g>
		{/* Border */}
		<path
			d={`M 1,1 L ${width - 1},1 L ${width - 1},${height - 1} 1,${height - 1} L 1,1`}
			stroke-width={1}
			fill={'none'}
			stroke={Colors.helpers}
			stroke-dasharray="2 2"
		/>
		{/* Center */}
		<path
			d={`M 1,${height / 2} L ${width - 1},${height / 2}`}
			stroke-width={1}
			fill={'none'}
			stroke={Colors.helpers}
			stroke-dasharray="2 2"
		/>
		<path
			d={`M ${width / 2},1 L ${width / 2},${height - 1}`}
			stroke-width={1}
			fill={'none'}
			stroke={Colors.helpers}
			stroke-dasharray="2 2"
		/>
	</g>
)
