import { BatteryCharging, BatteryMedium, Sun, SunDim } from 'lucide-preact'
import styled from 'styled-components'
import type { Reported } from './context/Devices'

const Charging = styled.span`
	color: var(--color-nordic-sun);
`

const NotCharging = styled.span`
	color: var(--color-nordic-light-grey);
`
export const PowerInfo = ({ state }: { state: Reported }) => {
	const sol = state?.sol?.v

	if (sol !== undefined) {
		if (sol.gain > 0)
			return (
				<>
					<dt>
						<Charging>
							<Sun strokeWidth={1} />
						</Charging>
					</dt>
					<dd>
						<Charging>
							{sol.gain.toFixed(2)} mA <BatteryCharging strokeWidth={1} />
							{sol.bat.toFixed(3)} V
						</Charging>
					</dd>
				</>
			)
		return (
			<>
				<dt>
					<NotCharging>
						<SunDim strokeWidth={1} />
					</NotCharging>
				</dt>
				<dd>
					<NotCharging>
						0 mA <BatteryMedium strokeWidth={1} />
						{sol.bat.toFixed(3)} V
					</NotCharging>
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
					<NotCharging>{batteryVoltage / 1000} V</NotCharging>
				</dd>
			</>
		)

	return null
}
