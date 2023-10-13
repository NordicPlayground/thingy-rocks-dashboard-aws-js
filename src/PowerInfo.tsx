import { BatteryCharging, BatteryMedium, Sun, SunDim } from 'lucide-preact'
import styled from 'styled-components'
import type { Reported } from './context/Devices.js'
import { useSettings } from './context/Settings.js'

const Charging = styled.span`
	color: var(--color-nordic-sun);
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

const PowerIcon = ({ state }: { state: Reported }) => {
	const { settings } = useSettings()
	const sol = state?.sol?.v
	if (sol === undefined) return <BatteryMedium strokeWidth={2} />
	const gain = Math.max(0, sol?.gain ?? 0)
	if (settings.consumptionThreshold > gain) return <SunDim strokeWidth={2} />
	return <Sun strokeWidth={2} />
}

export const PowerInfo = ({
	state,
	onClick,
}: {
	state: Reported
	onClick?: () => unknown
}) => {
	const { settings } = useSettings()
	const sol = state?.sol?.v
	const gain = Math.max(0, sol?.gain ?? 0)
	const charging = gain > settings.consumptionThreshold
	const ChargeState = charging ? Charging : NotCharging

	if (sol !== undefined) {
		return (
			<>
				<dt>
					<ChargeState>
						<PowerIcon state={state} />
					</ChargeState>
				</dt>
				<dd>
					<button type={'button'} onClick={() => onClick?.()}>
						<ChargeState>
							{sol.gain.toFixed(2)} mA{' '}
							{charging ? (
								<BatteryCharging strokeWidth={1} />
							) : (
								<BatteryMedium strokeWidth={1} />
							)}
							{sol.bat.toFixed(3)} V
						</ChargeState>
					</button>
				</dd>
			</>
		)
	}

	const batteryVoltage = state?.bat?.v

	if (batteryVoltage !== undefined)
		return (
			<>
				<dt>
					<NotCharging>
						<BatteryMedium strokeWidth={1} />
					</NotCharging>
				</dt>
				<dd>
					<button type={'button'} onClick={() => onClick?.()}>
						<NotCharging>{batteryVoltage / 1000} V</NotCharging>
					</button>
				</dd>
			</>
		)

	return null
}
