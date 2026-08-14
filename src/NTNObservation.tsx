import {
	LwM2MObjectID,
	type NTNObservation_14504,
} from '@hello.nrfcloud.com/proto-map/lwm2m'
import {
	Angle,
	ArrowLeftRightIcon,
	Network,
	Orbit,
	RadioTower,
	Satellite,
	Signal,
} from 'lucide-preact'
import type { Device } from './DeviceType.ts'
import { useLwM2MObjects } from './context/LwM2M.tsx'

export const NTNObservation = ({ device }: { device: Device }) => {
	const { objects } = useLwM2MObjects()
	const deviceObjects = objects[device.id]
	const maybeNTNObservation = deviceObjects?.find(
		({ ObjectID }) => ObjectID === LwM2MObjectID.NTNObservation_14504,
	)
	const resources = maybeNTNObservation?.Resources as
		| NTNObservation_14504['Resources']
		| undefined
	if (resources === undefined) return null
	return (
		<>
			<dt>
				<Satellite strokeWidth={2} />
			</dt>
			<dd>
				{resources[0] !== undefined && (
					<abbr title="Orbit">
						<Orbit strokeWidth={1} />
						{resources[0]}
					</abbr>
				)}
				{resources[1] !== undefined && (
					<abbr title="Constellation">
						<Network strokeWidth={1} />
						{resources[1]}
						{resources[1]}
					</abbr>
				)}
				{resources[2] !== undefined && (
					<abbr title="Cell">
						<RadioTower strokeWidth={1} />
						{resources[2]}
					</abbr>
				)}
				{resources[3] !== undefined && (
					<abbr title="Satellite Elevation">
						<Angle strokeWidth={1} />
						{resources[3]}°
					</abbr>
				)}
				{resources[4] !== undefined && (
					<abbr title="Signal Strength">
						<Signal strokeWidth={1} />
						{resources[4]} dBm
					</abbr>
				)}
				{resources[5] !== undefined && (
					<abbr title="Time to attach">
						<ArrowLeftRightIcon strokeWidth={1} />
						{resources[5]} s
					</abbr>
				)}
			</dd>
		</>
	)
}
