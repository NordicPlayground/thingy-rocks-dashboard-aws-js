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

	const is91x = dev.brdV.includes('9161') || dev.brdV.includes('9131')

	try {
		needsMfwUpdate =
			compareVersions(
				is91x ? MODEM_FIRMWARE_RELEASE_91x : MODEM_FIRMWARE_RELEASE_9160,
				mfw,
			) === 1
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
				{needsMfwUpdate && !is91x && (
					<abbr
						title={`Modem firmware update available, device is running ${dev.modV}, release version is ${MODEM_FIRMWARE_RELEASE_9160}`}
					>
						<a
							href="https://www.nordicsemi.com/Products/nRF9160/Download?lang=en#infotabs"
							target="_blank"
						>
							MFW update available ({MODEM_FIRMWARE_RELEASE_9160})
						</a>
					</abbr>
				)}
				{needsMfwUpdate && is91x && (
					<abbr
						title={`Modem firmware update available, device is running ${dev.modV}, release version is ${MODEM_FIRMWARE_RELEASE_91x}`}
					>
						<a
							href="https://www.nordicsemi.com/Products/nRF9161/Download?lang=en#infotabs"
							target="_blank"
						>
							MFW update available ({MODEM_FIRMWARE_RELEASE_91x})
						</a>
					</abbr>
				)}
			</WarningDD>
		</>
	)
}
