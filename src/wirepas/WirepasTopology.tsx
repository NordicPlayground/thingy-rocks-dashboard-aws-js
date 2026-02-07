import { isEqual } from 'lodash-es'
import { X } from 'lucide-preact'
import type { Ref } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { Button, ChartContainer } from '../chart/DeviceHistory.js'
import { useDevices } from '../context/Devices.js'
import { isWirepasGateway } from '../DeviceType.ts'
import { hideDetails, useDetails } from '../hooks/useDetails.js'
import { parseWirepasNodes, type Connection } from './parseWirepasNodes.js'
import { WirepasTopologyDiagram } from './WirepasTopologyDiagram.js'

export const WirepasTopology = () => {
	const deviceId = useDetails()
	const { devices, type } = useDevices()

	if (deviceId === undefined) return null
	const maybeDevice = devices[deviceId]
	if (maybeDevice === undefined) return null
	const gw = { ...maybeDevice, type: type(maybeDevice.id) }
	if (!isWirepasGateway(gw)) return null
	const connections = parseWirepasNodes(gw.state.nodes)
	if (connections.length === 0) return null

	return <Chart connections={connections} key={deviceId} />
}

const Chart = ({ connections }: { connections: Connection[] }) => {
	const [c, setC] = useState<Connection[]>(connections)

	useEffect(() => {
		if (!isEqual(c, connections)) {
			setC(connections)
		}
	}, [])

	const [width, height] = [500, 500]
	const containerRef = useRef<HTMLDivElement>()
	return (
		<ChartContainer
			ref={containerRef as Ref<HTMLElement>}
			style={{ height: `${height}px`, width: `${width}px` }}
		>
			<WirepasTopologyDiagram connections={c} size={{ width, height }} />
			<Button type={'button'} onClick={() => hideDetails()}>
				<X />
			</Button>
		</ChartContainer>
	)
}
