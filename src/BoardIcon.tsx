import { isVideoDevice, type Device } from './DeviceType.ts'
import { DKIcon } from './icons/DKIcon.js'
import { IridiumIcon } from './icons/Iridium.tsx'
import { KeysightIcon } from './icons/Keysight.js'
import { MyriotaIcon } from './icons/Myriota.js'
import { NRF93 } from './icons/NRF93.tsx'
import { SateliotIcon } from './icons/SateliotIcon.tsx'
import { SkyloIcon } from './icons/Skylo.js'
import { ThingyIcon } from './icons/ThingyIcon.js'
import { ThingyXIcon } from './icons/ThingyXIcon.js'

export const BoardIcon = ({ device }: { device: Device }) => {
	if ((device.id, device.state?.roam?.v?.mccmnc === 90197))
		return <SateliotIcon class="icon" style={{ padding: '2px 0' }} />
	const brdV = device.state?.dev?.v?.brdV
	if ((device.id, device.state?.roam?.v?.mccmnc === 90103))
		return <IridiumIcon class="icon" />
	if (isVideoDevice(device)) return <NRF93 class="icon" />
	if (brdV?.includes('keysight') ?? false) return <KeysightIcon class="icon" />
	if (brdV?.includes('skylo') ?? false)
		return <SkyloIcon class="icon" style={{ padding: '2px 0' }} />
	if (brdV?.includes('myriota') ?? false) return <MyriotaIcon class="icon" />
	if (brdV?.toLowerCase()?.includes('nrf93m1dk_nrf93m1') ?? false)
		return <NRF93 class="icon" />
	if (brdV?.toLowerCase()?.includes('nrf93') ?? false)
		return <NRF93 class="icon" />
	if (brdV?.includes('nrf9160dk') ?? false) return <DKIcon class="icon" />
	if (brdV?.includes('thingy91x') ?? false) return <ThingyXIcon class="icon" />
	return <ThingyIcon class="icon" />
}
