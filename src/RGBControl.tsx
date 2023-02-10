import { Check, Lightbulb, Palette } from 'lucide-preact'
import { useState } from 'preact/hooks'
import styled from 'styled-components'
import { hexToRGB } from './hexToRGB'
import { RGB, rgbToHex } from './rgbToHex'

const ColorInput = styled.input`
	border: 0;
	width: 25px;
	height: 25px;
	margin-left: 0.5rem;
	margin-right: 0.5rem;
`

const presetColors: RGB[] = [
	hexToRGB('#00a9ce'),
	hexToRGB('#c6007e'),
	hexToRGB('#00ff00'),
]

export const RGBControl = ({
	color,
	onChange,
}: {
	color: RGB
	onChange: (color: RGB) => void
}) => {
	const [current, set] = useState<RGB>(color)
	return (
		<>
			<dt>
				<Palette strokeWidth={1} />
			</dt>
			<dd class="d-flex">
				{presetColors.map((color) => (
					<button
						type="button"
						class="btn btn-link"
						onClick={() => {
							onChange(color)
							set(color)
						}}
					>
						<Lightbulb color={`#${rgbToHex(color)}`} />
					</button>
				))}
				<ColorInput
					type="color"
					value={`#${rgbToHex(current)}`}
					onChange={(e: Event) => {
						set(hexToRGB((e.target as HTMLInputElement).value))
					}}
				/>
				<button
					type="button"
					class="btn btn-link"
					onClick={() => {
						onChange(current)
					}}
				>
					<Check strokeWidth={1} />
				</button>
			</dd>
		</>
	)
}
