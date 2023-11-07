import {
	AlertCircle,
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
	if (SoC > 80) return <BatteryFull strokeWidth={1} />
	if (SoC > 50) return <BatteryMedium strokeWidth={1} />
	if (SoC > 25) return <BatteryLow strokeWidth={1} />
	return <BatteryWarning strokeWidth={1} />
}

const formatter = new Intl.RelativeTimeFormat(undefined, { style: 'long' })
const formatDistance = (seconds: number): string => {
	if (seconds > 60 * 60 * 24 * 3)
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
	const { V, I: current, T: temp, SoC, TTE } = fg.v
	const isCharging = (current ?? 0) < 0
	const ChargingIndicator = isCharging ? Charging : NotCharging
	return (
		<>
			<dt>
				{SoC !== undefined && (
					<ChargingIndicator>
						<button type={'button'} onClick={() => onClick?.()}>
							{isCharging ? (
								<BatteryCharging strokeWidth={1} />
							) : (
								<BatteryIcon SoC={SoC} />
							)}
						</button>
					</ChargingIndicator>
				)}
				{SoC === undefined && (
					<NotCharging>
						<BatteryMedium strokeWidth={1} />
					</NotCharging>
				)}
			</dt>
			<dd class="d-flex flex-column align-items-start justify-content-center">
				{(SoC !== undefined || TTE !== undefined) && (
					<ChargingIndicator>
						<button type={'button'} onClick={() => onClick?.()}>
							{SoC !== undefined && <span class="me-2">{SoC}%</span>}
							{TTE !== undefined && (
								<>
									<span class="me-1">(empty {formatDistance(TTE)})</span>
									<abbr title={'Time-to-empty estimate is experimental.'}>
										<AlertCircle strokeWidth={1} class="me-0" />
									</abbr>
								</>
							)}
							{isCharging && <span class="me-1">(charging)</span>}
						</button>
					</ChargingIndicator>
				)}
				<ChargingIndicator>
					<button type={'button'} onClick={() => onClick?.()}>
						{V !== undefined && <span class="me-1">{V / 1000} V</span>}
						{current !== undefined && (
							<span class="me-1">
								<Zap strokeWidth={1} class="me-0" />
								{current} mA
							</span>
						)}
						{temp !== undefined && (
							<span class="me-1">
								<Thermometer strokeWidth={1} class="me-0" />
								{temp / 10} °C
							</span>
						)}
					</button>
				</ChargingIndicator>
			</dd>
		</>
	)
}
