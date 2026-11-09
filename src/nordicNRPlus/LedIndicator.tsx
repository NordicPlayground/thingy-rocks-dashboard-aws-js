import { useState } from 'preact/hooks'
import { css, keyframes, styled } from 'styled-components'
import type { Reported } from '../DeviceType.ts'

// Brightness is shown as opacity

// Squared triangle wave: a linear ramp looks like it stays near full brightness
const breathe = keyframes`
	0%, 100% { opacity: 0.05; }
	25%, 75% { opacity: 0.3; }
	50% { opacity: 1; }
`
// Full brightness, then a quadratic fade out
const pulse = keyframes`
	0% { opacity: 1; }
	25% { opacity: 0.56; }
	50% { opacity: 0.25; }
	75% { opacity: 0.06; }
	100% { opacity: 0.05; }
`
const blink = keyframes`
	0%, 49% { opacity: 1; }
	50%, 100% { opacity: 0.1; }
`
// The hue goes once around the colour wheel, at full brightness
const rainbow = keyframes`
	from { filter: hue-rotate(0deg); }
	to { filter: hue-rotate(360deg); }
`
// Random brightness over a dim orange
const fire = keyframes`
	0% { opacity: 0.6; }
	12% { opacity: 1; }
	27% { opacity: 0.45; }
	41% { opacity: 0.85; }
	58% { opacity: 0.35; }
	73% { opacity: 0.95; }
	88% { opacity: 0.55; }
	100% { opacity: 0.6; }
`

const DEFAULT_PERIOD_MS = 2000
const FIRE_PERIOD_MS = 700

type Effect = {
	animation: ReturnType<typeof keyframes>
	timing: string
}

const effects: Record<string, Effect> = {
	breathe: { animation: breathe, timing: 'linear' },
	random_breathe: { animation: breathe, timing: 'linear' },
	pulse: { animation: pulse, timing: 'linear' },
	blink: { animation: blink, timing: 'steps(1, end)' },
	rainbow: { animation: rainbow, timing: 'linear' },
	fire: { animation: fire, timing: 'ease-in-out' },
	// 'steady', 'off' and unknown modes have no effect
}

// No colour is reported for effects that choose it themselves
const RAINBOW_BASE = 'rgb(255, 0, 0)'
const FIRE_COLOR = 'rgb(255, 70, 0)'

const Dot = styled.span<{ $effect?: Effect; $periodMs: number }>`
	display: inline-block;
	width: 0.75rem;
	height: 0.75rem;
	border-radius: 50%;
	flex-shrink: 0;
	${({ $effect, $periodMs }) =>
		$effect !== undefined &&
		css`
			animation: ${$effect.animation} ${$periodMs}ms ${$effect.timing} infinite;
		`}
`

const OFF_COLOR = '#555e63'

const randomHue = () => Math.floor(Math.random() * 360)

/**
 * Shows the colour of the device's RGB LED and its current effect.
 */
export const LedIndicator = ({ led }: { led?: Reported['led'] }) => {
	// random_breathe picks a new hue each cycle, while the LED is dark
	const [hue, setHue] = useState(randomHue)
	if (led === undefined) return null
	const { red, green, blue, mode, period } = led.v
	const hasColor = red !== 0 || green !== 0 || blue !== 0
	const isOff = mode === 'off' || (mode === undefined && !hasColor)
	const color = isOff
		? OFF_COLOR
		: mode === 'rainbow' || mode === 'random_breathe'
			? RAINBOW_BASE
			: mode === 'fire'
				? FIRE_COLOR
				: `rgb(${red}, ${green}, ${blue})`
	const label = isOff ? 'LED off' : `LED ${mode ?? color}`
	const effect = isOff || mode === undefined ? undefined : effects[mode]
	return (
		<Dot
			role="img"
			aria-label={label}
			title={label}
			$effect={effect}
			$periodMs={
				period !== undefined && period > 0
					? period
					: mode === 'fire'
						? FIRE_PERIOD_MS
						: DEFAULT_PERIOD_MS
			}
			onAnimationIteration={
				mode === 'random_breathe' ? () => setHue(randomHue()) : undefined
			}
			style={{
				backgroundColor: color,
				boxShadow: isOff ? 'none' : `0 0 6px 1px ${color}`,
				...(mode === 'random_breathe' && {
					filter: `hue-rotate(${hue}deg)`,
				}),
			}}
		/>
	)
}
