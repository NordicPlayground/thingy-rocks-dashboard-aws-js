import { Lightbulb, LightbulbOff, ToggleLeft, ToggleRight } from 'lucide-preact'
import { useState } from 'preact/hooks'

export const OnOffControl = ({
	on,
	onChange,
}: {
	on: boolean
	onChange: (desired: boolean) => void
}) => {
	const [desired, setDesired] = useState<boolean>(on)
	return (
		<>
			{on && <Lightbulb color="#00ff00" strokeWidth={1} />}
			{!on && <LightbulbOff strokeWidth={1} />}
			<button
				class="btn btn-link ms-2"
				type="button"
				onClick={() => {
					const newDesired = !desired
					setDesired(newDesired)
					onChange(newDesired)
				}}
			>
				{!desired && <ToggleLeft />}
				{desired && <ToggleRight />}
			</button>
		</>
	)
}
