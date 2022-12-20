import {
	Angry,
	Annoyed,
	Frown,
	Laugh,
	Meh,
	Skull,
	Slash,
	Smile,
	Thermometer,
} from 'lucide-preact'
import styled from 'styled-components'
import type { Device } from './context/Devices'

export const EnvironmentInfo = ({
	device,
	onClick,
}: {
	device: Device
	onClick?: () => unknown
}) => {
	const env = device.state?.env?.v
	const iaq = env?.bsec_iaq
	if (env === undefined) return null
	return (
		<>
			<dt>
				<Thermometer strokeWidth={2} />
			</dt>
			<dd>
				<button type={'button'} onClick={() => onClick?.()}>
					{env.temp.toFixed(1)} °C
					{iaq !== undefined && <IAQ iaq={iaq} />}
				</button>
			</dd>
		</>
	)
}

const BSECLabel = styled.abbr`
	margin-left: 0.5rem;
`

// See https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme680-ds001.pdf
const IAQ = ({ iaq }: { iaq: number }) => {
	let iaqLabel = 'unknown'
	let Icon = Slash
	if (iaq >= 0 && iaq <= 50) {
		iaqLabel = 'Excellent'
		Icon = Laugh
	} else if (iaq <= 100) {
		iaqLabel = 'Good'
		Icon = Smile
	} else if (iaq <= 150) {
		iaqLabel = 'Lightly Polluted'
		Icon = Meh
	} else if (iaq <= 200) {
		iaqLabel = 'Moderately Polluted'
		Icon = Annoyed
	} else if (iaq <= 250) {
		iaqLabel = 'Heavily Polluted'
		Icon = Frown
	} else if (iaq <= 350) {
		iaqLabel = 'Severely Polluted'
		Icon = Angry
	} else if (iaq > 350) {
		iaqLabel = 'Extremely Polluted'
		Icon = Skull
	}

	return (
		<BSECLabel title={iaqLabel}>
			<Icon strokeWidth={2} />
		</BSECLabel>
	)
}
