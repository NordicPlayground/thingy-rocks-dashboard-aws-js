import { compareVersions } from 'compare-versions'
import { AlertTriangle } from 'lucide-preact'
import styled from 'styled-components'
import type { Reported } from './context/Devices'

const WarningDT = styled.dt`
	color: var(--color-nordic-fall);
`
const WarningDD = styled.dd`
	color: var(--color-nordic-fall);
	abbr {
		display: block;
	}
`

export const UpdateWarning = ({ reported }: { reported: Reported }) => {
	const dev = reported?.dev?.v

	if (dev === undefined) return null

	const mfw = dev.modV.replace(/^mfw_nrf[0-9]+_/, '')
	const needsMfwUpdate = compareVersions(MODEM_FIRMWARE_RELEASE, mfw) === 1
	const fw = dev.appV.replace(/-.+/, '')
	const needsFwUpdate = compareVersions(FIRMWARE_RELEASE, fw) === 1

	const needsUpdate = needsFwUpdate || needsMfwUpdate

	if (!needsUpdate) return null

	return (
		<>
			<WarningDT>
				<AlertTriangle />
			</WarningDT>
			<WarningDD>
				{needsFwUpdate && (
					<abbr
						title={`Firmware update available, device is running ${dev.appV}, release version is ${FIRMWARE_RELEASE}`}
					>
						FW update available ({FIRMWARE_RELEASE})
					</abbr>
				)}
				{needsMfwUpdate && (
					<abbr
						title={`Modem firmware update available, device is running ${dev.modV}, release version is ${MODEM_FIRMWARE_RELEASE}`}
					>
						MFW update available ({MODEM_FIRMWARE_RELEASE})
					</abbr>
				)}
			</WarningDD>
		</>
	)
}
