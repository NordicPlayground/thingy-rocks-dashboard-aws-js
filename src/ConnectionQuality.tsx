import { LwM2MObjectID } from '@hello.nrfcloud.com/proto-map/lwm2m'
import { ArrowLeftRightIcon } from 'lucide-preact'
import type { Device } from './context/Devices.tsx'
import { useLwM2MObjects } from './context/LwM2M.tsx'

export const ConnectionQuality = ({
	device,
	onClick,
}: {
	device: Device
	onClick?: () => unknown
}) => {
	const { objects } = useLwM2MObjects()
	const deviceObjects = objects[device.id]
	const maybeConnectionQuality = deviceObjects?.find(
		({ ObjectID }) => ObjectID === LwM2MObjectID.ConnectionQuality_14501,
	)
	const ping = maybeConnectionQuality?.Resources[0]
	if (ping === undefined) return null
	return (
		<>
			<dt>
				<ArrowLeftRightIcon strokeWidth={2} />
			</dt>
			<dd>
				<button
					type={'button'}
					onClick={() => {
						onClick?.()
					}}
				>
					{ping} ms
				</button>
			</dd>
		</>
	)
}
