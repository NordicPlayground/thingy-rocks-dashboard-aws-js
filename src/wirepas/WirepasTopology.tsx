import type { Ref } from 'preact'
import { ChartContainer, Button } from '../chart/DeviceHistory.js'
import { isWirepasGateway, useDevices } from '../context/Devices.js'
import { useWirepasTopology } from '../context/showWirepasTopology.js'
import { parseWirepasNodes } from './parseWirepasNodes.js'
import { useRef } from 'preact/hooks'
import { WirepasTopologyDiagram } from './WirepasTopologyDiagram.js'
import { X } from 'lucide-preact'

export const WirepasTopology = () => {
	const { deviceId, hide } = useWirepasTopology()
	const { devices, type } = useDevices()
	const containerRef = useRef<HTMLDivElement>()
	console.log(deviceId)
	if (deviceId === undefined) return null
	const maybeDevice = devices[deviceId]
	if (maybeDevice === undefined) return null
	const gw = { ...maybeDevice, type: type(maybeDevice.id) }
	if (!isWirepasGateway(gw)) return null

	const parsedWirepasTopology = parseWirepasNodes(gw.state.nodes)

	console.log(parsedWirepasTopology)

	const [width, height] = [500, 500]

	return (
		<ChartContainer
			ref={containerRef as Ref<HTMLElement>}
			style={{ height: `${height}px`, width: `${width}px` }}
		>
			<WirepasTopologyDiagram
				connections={parsedWirepasTopology}
				size={{ width: 500, height: 500 }}
			/>
			<Button type={'button'} onClick={() => hide()}>
				<X />
			</Button>
		</ChartContainer>
	)
}
