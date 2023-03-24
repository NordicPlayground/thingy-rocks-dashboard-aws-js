import { CloudOff, MapPin, MapPinOff } from 'lucide-preact'
import styled from 'styled-components'
import { GeoLocationAge } from './GeoLocationAge'
import { locationSourceColors } from './colors'
import type { Device, GeoLocation } from './context/Devices'
import { useDevices } from './context/Devices'
import { LocationSourceLabels } from './context/LocationSourceLabels'
import { sortLocations } from './sortLocations'

const LocationSourceSwitch = styled.button`
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
	font-weight: var(--monospace-font-weight-bold);
	color: var(--color-nordic-middle-grey);
	text-decoration: line-through;
	text-transform: uppercase;
	.lucide {
		margin-right: 0.25rem;
	}
`

const LocationDetails = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
	li {
		margin: 0;
		padding: 0;
	}
`

const LocationSourceButton = ({
	device: { id, hiddenLocations },
	location,
}: {
	device: Device
	location: GeoLocation
}) => {
	const { toggleHiddenLocation } = useDevices()
	const { source } = location

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
					<LocationDetails>
						{rankedLocations.map((location) => (
							<li>
								<LocationSourceButton device={device} location={location} />
								<small>
									(
									{location.ts !== undefined && (
										<>
											<GeoLocationAge age={location.ts} />,{' '}
										</>
									)}
									<span>{Math.round(location.accuracy)} m</span>)
								</small>
							</li>
						))}
					</LocationDetails>
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
