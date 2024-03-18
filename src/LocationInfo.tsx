import { CloudOff, MapPin, MapPinOff } from 'lucide-preact'
import { styled } from 'styled-components'
import { GeoLocationAge } from './GeoLocationAge.js'
import { locationSourceColors } from './colors.js'
import type { Device } from './context/Devices.js'
import { LocationSourceLabels } from './context/LocationSourceLabels.js'
import { sortLocations } from './sortLocations.js'
import { removeOldLocation } from './removeOldLocation.js'
import { useMap } from './context/Map.js'

const LocationSource = styled.span`
	font-weight: var(--monospace-font-weight-bold);
	margin-right: 0.5rem;
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

export const LocationInfo = ({ device }: { device: Device }) => {
	const { location, state } = device
	const nod = state?.cfg?.nod ?? []
	const rankedLocations = Object.values(location ?? [])
		.sort(sortLocations)
		.filter(removeOldLocation)
	const hasLocation = rankedLocations.length > 0
	const map = useMap()
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
								<button
									type="button"
									onClick={() => {
										map.center(location)
									}}
								>
									<LocationSource
										style={{ color: locationSourceColors[location.source] }}
									>
										{LocationSourceLabels[location.source]}
									</LocationSource>
									<small>
										(
										{location.ts !== undefined && (
											<>
												<GeoLocationAge age={location.ts} />,{' '}
											</>
										)}
										<span>{Math.round(location.accuracy ?? 500)} m</span>)
									</small>
								</button>
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
