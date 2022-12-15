import { RSRP, SignalQualityTriangle } from '@nordicsemiconductor/rsrp-bar'
import {
	LucideProps,
	Signal,
	SignalHigh,
	SignalLow,
	SignalMedium,
	SignalZero,
	Slash,
} from 'lucide-preact'
import styled from 'styled-components'
import { Device, EnergyEstimate } from './context/Devices'

const EnergyEstimateIcons: Record<
	EnergyEstimate,
	(props: LucideProps) => JSX.Element
> = {
	[EnergyEstimate.Bad]: SignalZero,
	[EnergyEstimate.Poor]: SignalLow,
	[EnergyEstimate.Normal]: SignalMedium,
	[EnergyEstimate.Good]: SignalHigh,
	[EnergyEstimate.Excellent]: Signal,
} as const

const EnergyEstimateDescription: Record<EnergyEstimate, string> = {
	[EnergyEstimate.Bad]:
		'Bad conditions. Difficulties in setting up connections. Maximum number of repetitions might be needed for data.',
	[EnergyEstimate.Poor]:
		'Poor conditions. Setting up a connection might require retries and a higher number of repetitions for data.',
	[EnergyEstimate.Normal]:
		'Normal conditions for cIoT device. No repetitions for data or only a few repetitions in the worst case.',
	[EnergyEstimate.Good]:
		'Good conditions. Possibly very good conditions for small amounts of data.',
	[EnergyEstimate.Excellent]:
		'Excellent conditions. Efficient data transfer estimated also for larger amounts of data.',
} as const

const EnergyEstimateLabel: Record<EnergyEstimate, string> = {
	[EnergyEstimate.Bad]: 'Bad',
	[EnergyEstimate.Poor]: 'Poor',
	[EnergyEstimate.Normal]: 'Normal',
	[EnergyEstimate.Good]: 'Good',
	[EnergyEstimate.Excellent]: 'Excellent',
} as const

const EestLabel = styled.abbr`
	margin-left: 0.5rem;
	&:before {
		content: '(';
	}
	&:after {
		content: ')';
	}
	font-size: 75%;
`

export const SignalQuality = ({ device }: { device: Device }) => {
	const rsrpDbm = device.state?.roam?.v?.rsrp
	const eest = device.state?.roam?.v?.eest

	if (rsrpDbm === undefined && eest === undefined) return null

	if (eest !== undefined) {
		const SignalIcon = EnergyEstimateIcons[eest] ?? Slash
		return (
			<>
				<dt>
					<abbr
						title={EnergyEstimateDescription[eest] ?? 'Unknown Energy Estimate'}
					>
						<SignalIcon strokeWidth={2} />
					</abbr>
				</dt>
				<dd>
					{rsrpDbm ?? '?'} dBm
					{eest !== undefined && (
						<EestLabel
							title={
								EnergyEstimateDescription[eest] ?? 'Unknown Energy Estimate'
							}
						>
							{EnergyEstimateLabel[eest] ?? 'unknown'}
						</EestLabel>
					)}
				</dd>
			</>
		)
	}

	return (
		<>
			<dt>
				{rsrpDbm !== undefined && (
					<RSRP
						dbm={rsrpDbm}
						renderBar={({ quality }) => (
							<SignalQualityTriangle
								quality={quality}
								color={'inherit'}
								class="rsrp"
							/>
						)}
						renderInvalid={() => <SignalZero strokeWidth={2} />}
					/>
				)}
			</dt>
			<dd>{rsrpDbm ?? '?'} dBm</dd>
		</>
	)
}
