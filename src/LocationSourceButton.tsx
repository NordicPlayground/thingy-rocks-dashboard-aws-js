import styled from 'styled-components'
import { locationSourceColors } from './colors'
import { Device, GeoLocationSource, useDevices } from './context/Devices'
import { LocationSourceLabels } from './context/LocationSourceLabels'

const LocationSourceSwitch = styled.button`
	font-size: 90%;
	font-weight: var(--monospace-font-weight-bold);
	& + & {
		margin-left: 0.25rem;
	}
`

const LocationSourceLabelDisabled = styled(LocationSourceSwitch)`
	color: var(--color-nordic-middle-grey);
	text-decoration: line-through;
`

export const LocationSourceButton = ({
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
