import {
	BatteryCharging,
	BatteryFull,
	BatteryLow,
	BatteryMedium,
	BatteryWarning,
	Thermometer,
	Zap,
} from 'lucide-preact'
import styled from 'styled-components'
import type { Reported } from './context/Devices'

const Charging = styled.span`
	color: var(--color-nordic-grass);
	.lucide {
		margin-right: 0.5rem;
	}
`

const NotCharging = styled.span`
	color: var(--color-nordic-middle-grey);
	.lucide {
		margin-right: 0.5rem;
	}
`

const BatteryIcon = ({ SoC }: { SoC: number }) => {
	if (SoC > 80) return <BatteryFull />
	if (SoC > 50) return <BatteryMedium />
	if (SoC > 25) return <BatteryLow />
	return <BatteryWarning />
}

const formatter = new Intl.RelativeTimeFormat(undefined, { style: 'long' })
const formatDistance = (seconds: number): string => {
	if (seconds > 60 * 60 * 24)
		return formatter.format(Math.ceil(seconds / (60 * 60 * 24)), 'days')
	if (seconds > 60 * 60)
		return formatter.format(Math.ceil(seconds / (60 * 60)), 'hours')
	if (seconds > 60) return formatter.format(Math.ceil(seconds / 60), 'minutes')
	return formatter.format(seconds, 'seconds')
}

export const FuelGauge = ({
	fg,
	onClick,
}: {
	fg: Pick<Required<Reported>, 'fg'>['fg']
	onClick?: () => unknown
}) => {
	const { V, I: current, T: temp, SoC, TTF, TTE } = fg.v
	const isCharging = current < 0
	return (
		<>
			<dt>
				<button type={'button'} onClick={() => onClick?.()}>
					{isCharging ? (
						<Charging>
							<BatteryCharging />
							<br />
							<span>{SoC}%</span>
						</Charging>
					) : (
						<NotCharging>
							<BatteryIcon SoC={SoC} />
							<br />
							<span>{SoC}%</span>
						</NotCharging>
					)}
				</button>
			</dt>
			<dd>
				<button type={'button'} onClick={() => onClick?.()}>
					{TTE !== undefined && (
						<span class="me-2">empty {formatDistance(TTE)}</span>
					)}
					{TTF !== undefined && (
						<span class="me-2">full {formatDistance(TTF)}</span>
					)}
				</button>
				<br />
				<button type={'button'} onClick={() => onClick?.()}>
					<span class="me-2">{V / 1000} V</span>
					<span class="me-2">
						<Zap strokeWidth={1} /> {current} mA
					</span>
					<span class="me-2">
						<Thermometer strokeWidth={1} />
						{temp / 10} °C
					</span>
				</button>
			</dd>
		</>
	)
}
