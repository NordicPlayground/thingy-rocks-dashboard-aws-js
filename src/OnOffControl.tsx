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
			<dt>
				{on && <Lightbulb strokeWidth={1} />}
				{!on && <LightbulbOff strokeWidth={1} />}
			</dt>
			<dd>
				<button
					class="btn btn-link"
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
			</dd>
		</>
	)
}
