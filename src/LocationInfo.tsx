import { CloudOff, MapPin, MapPinOff } from 'lucide-preact'
import styled from 'styled-components'
import { locationSourceColors } from './colors'
import type { Device } from './context/Devices'
import { GeoLocationSource, useDevices } from './context/Devices'
import { LocationSourceLabels } from './context/LocationSourceLabels'
import { sortLocations } from './sortLocations'

const LocationSourceSwitch = styled.button`
	font-size: 90%;
	font-weight: var(--monospace-font-weight-bold);
	margin-right: 0.5rem;
`

const LocationSourceLabelDisabled = styled(LocationSourceSwitch)`
	color: var(--color-nordic-middle-grey);
	text-decoration: line-through;
`

const NoLocation = styled.span`
	color: var(--color-nordic-middle-grey);
`

const LocationSourceSamplingDisabled = styled.span`
	font-size: 90%;
	font-weight: var(--monospace-font-weight-bold);
	color: var(--color-nordic-middle-grey);
	text-decoration: line-through;
	text-transform: uppercase;
	.lucide {
		margin-right: 0.25rem;
	}
`

const LocationSourceButton = ({
	device: { id, hiddenLocations },
	source,
}: {
	device: Device
	source: GeoLocationSource
}) => {
	const { toggleHiddenLocation } = useDevices()

	const isDisabled = hiddenLocations?.[source] ?? false

	if (isDisabled)
		return (
			<LocationSourceLabelDisabled
				onClick={() => {
					toggleHiddenLocation(id, source)
				}}
			>
				{LocationSourceLabels[source]}
			</LocationSourceLabelDisabled>
		)

	return (
		<LocationSourceSwitch
			style={{ color: locationSourceColors[source] }}
			onClick={() => {
				toggleHiddenLocation(id, source)
			}}
		>
			{LocationSourceLabels[source]}
		</LocationSourceSwitch>
	)
}

export const LocationInfo = ({ device }: { device: Device }) => {
	const { location, state } = device
	const nod = state?.cfg?.nod ?? []
	const rankedLocations = Object.values(location ?? []).sort(sortLocations)
	const hasLocation = rankedLocations.length > 0
	if (hasLocation || nod.length > 0)
		return (
			<>
				<dt>
					{hasLocation ? (
						<MapPin strokeWidth={2} />
					) : (
						<NoLocation>
							<MapPinOff strokeWidth={2} />
						</NoLocation>
					)}
				</dt>
				<dd>
					{rankedLocations.map(({ source }) => (
						<LocationSourceButton device={device} source={source} />
					))}
					{nod.length > 0 &&
						nod.map((s) => (
							<LocationSourceSamplingDisabled>
								<CloudOff strokeWidth={1} />
								{s}
							</LocationSourceSamplingDisabled>
						))}
				</dd>
			</>
		)

	return null
}
