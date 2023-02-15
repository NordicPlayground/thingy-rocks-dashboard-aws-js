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
		a {
			color: inherit;
		}
	}
`

export const UpdateWarning = ({ reported }: { reported: Reported }) => {
	const dev = reported?.dev?.v

	if (dev === undefined) return null

	const mfw = dev.modV.replace(/^mfw_nrf[0-9]+_/, '')
	const fw = dev.appV.replace(/-.+/, '')

	let needsMfwUpdate = false
	let needsFwUpdate = false

	try {
		needsMfwUpdate = compareVersions(MODEM_FIRMWARE_RELEASE, mfw) === 1
	} catch {
		// pass
	}

	try {
		needsFwUpdate = compareVersions(FIRMWARE_RELEASE, fw) === 1
	} catch {
		// pass
	}

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
						<a
							href="https://github.com/NordicPlayground/thingy-world-firmware-aws/releases"
							target="_blank"
						>
							FW update available ({FIRMWARE_RELEASE})
						</a>
					</abbr>
				)}
				{needsMfwUpdate && (
					<abbr
						title={`Modem firmware update available, device is running ${dev.modV}, release version is ${MODEM_FIRMWARE_RELEASE}`}
					>
						<a
							href="https://www.nordicsemi.com/Software-and-tools/Development-Kits/nRF9160-DK/Download#infotabs"
							target="_blank"
						>
							MFW update available ({MODEM_FIRMWARE_RELEASE})
						</a>
					</abbr>
				)}
			</WarningDD>
		</>
	)
}
