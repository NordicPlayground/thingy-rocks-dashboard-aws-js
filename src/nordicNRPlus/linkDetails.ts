import type {
	NordicNrplusConnectionProfile,
	NordicNrplusNeighbor,
} from '../DeviceType.ts'

const formatSeconds = (seconds: number): string => {
	if (seconds >= 65535) return 'more than 18 hours ago'
	if (seconds >= 3600) return `${Math.floor(seconds / 3600)} h ago`
	if (seconds >= 60) return `${Math.floor(seconds / 60)} min ago`
	return `${seconds} s ago`
}

/**
 * Packet loss in percent, derived from the HARQ NACKs and the TX attempts.
 *
 * Both counters are taken from the modem's statistics window and are not
 * lifetime totals, so this is the loss in that window.
 */
export const packetLoss = ({
	txAttempts,
	harqNack,
}: Pick<NordicNrplusNeighbor, 'txAttempts' | 'harqNack'>):
	number | undefined => {
	if (txAttempts === undefined || harqNack === undefined) return undefined
	if (txAttempts === 0) return undefined
	return Math.min(100, Math.round((harqNack / txAttempts) * 100))
}

/**
 * Describes the link to a neighbor, one line per available value.
 */
export const linkDetails = (neighbor: NordicNrplusNeighbor): string => {
	const lines: string[] = []
	if (neighbor.txPower !== undefined) {
		lines.push(
			`TX power: ${neighbor.txPower} dBm` +
				(neighbor.neighborTxPower !== undefined
					? ` (neighbor: ${neighbor.neighborTxPower} dBm)`
					: ''),
		)
	} else if (neighbor.neighborTxPower !== undefined) {
		lines.push(`Neighbor TX power: ${neighbor.neighborTxPower} dBm`)
	}
	if (neighbor.rxMcs !== undefined) lines.push(`RX MCS: ${neighbor.rxMcs}`)
	const loss = packetLoss(neighbor)
	if (loss !== undefined) {
		lines.push(
			`Packet loss: ${loss} % (${neighbor.harqNack} NACKs of ${neighbor.txAttempts} attempts)`,
		)
	}
	if (neighbor.missedBeacons !== undefined)
		lines.push(`Missed beacons: ${neighbor.missedBeacons}`)
	if (neighbor.lastSeen !== undefined)
		lines.push(`Last heard: ${formatSeconds(neighbor.lastSeen)}`)
	return lines.join('\n')
}

/**
 * Describes the IP addresses of a device.
 */
export const addressDetails = (
	profile?: Pick<NordicNrplusConnectionProfile, 'globalIpv6' | 'linkLocalIpv6'>,
): string => {
	const lines: string[] = []
	if (profile?.globalIpv6 !== undefined)
		lines.push(`IPv6: ${profile.globalIpv6}`)
	if (profile?.linkLocalIpv6 !== undefined)
		lines.push(`Link-local: ${profile.linkLocalIpv6}`)
	return lines.join('\n')
}
