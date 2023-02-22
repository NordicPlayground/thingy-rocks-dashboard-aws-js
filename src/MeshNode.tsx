import { Focus, Lightbulb, LightbulbOff } from 'lucide-preact'
import styled from 'styled-components'
import { ButtonPressDiff } from './ButtonPress'
import type { MeshNode as MeshNodeDevice } from './context/Devices'
import { useSettings } from './context/Settings'
import { useWebsocket } from './context/WebsocketConnection'
import { DeviceName } from './DeviceName'
import { OnOffControl } from './OnOffControl'
import type { RGB } from './rgbToHex'

const isOn = (color: RGB) => (color.reduce((total, c) => c + total, 0) ?? 0) > 0

const Ul = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0 0 0 0;
`

export const MeshNode = ({ device }: { device: MeshNodeDevice }) => {
	const { send } = useWebsocket()
	const { settings } = useSettings()
	const { node, hops, travelTimeMs } = device.state.meshNode
	const buttonPress = device.state?.btn
	const code = settings.managementCodes[device.id]
	const unlocked = code !== undefined
	const ledIsOn = isOn(device.state?.led?.v?.color ?? [0, 0, 0])

	return (
		<Ul>
			<li>
				<DeviceName device={device} fallback={node.toString()} />
			</li>
			<li>
				{!unlocked && (
					<span class="me-2">
						{ledIsOn && <Lightbulb strokeWidth={1} color="#00ff00" />}
						{!ledIsOn && <LightbulbOff strokeWidth={1} />}
					</span>
				)}
				{hops !== undefined && (
					<>
						{hops} {hops > 1 ? 'hops' : 'hop'},{' '}
					</>
				)}
				<abbr title="travel time">{travelTimeMs} ms</abbr>
			</li>
			{buttonPress !== undefined && (
				<ButtonPressDiff
					key={`${node}-press-${buttonPress.ts}`}
					buttonPress={buttonPress}
				>
					{(diffSeconds) => (
						<li style={{ color: 'var(--color-nordic-pink)' }}>
							<Focus strokeWidth={2} /> {diffSeconds} seconds ago
						</li>
					)}
				</ButtonPressDiff>
			)}
			{unlocked && (
				<OnOffControl
					on={ledIsOn}
					onChange={(on) => {
						send({
							desired: {
								led: {
									v: {
										color: on ? [255, 255, 255] : [0, 0, 0],
									},
								},
							},
							deviceId: device.id,
							code: code,
						})
					}}
				/>
			)}
		</Ul>
	)
}
