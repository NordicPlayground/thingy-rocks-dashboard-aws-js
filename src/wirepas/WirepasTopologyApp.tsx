import '../../static/base.css'
import { WirepasTopologyDiagram } from './WirepasTopologyDiagram.js'
import { parseWirepasNodes } from './parseWirepasNodes.js'

export const App = () => {
	const parsedWirepasTopology = parseWirepasNodes({
		'6788325': {
			lat: 62,
			hops: 2,
			ts: '2024-02-07T17:11:49.894Z',
			qos: 1,
		},
		'35410703': {
			lat: 7,
			hops: 2,
			ts: '2024-02-07T17:11:50.810Z',
			qos: 1,
		},
		'169302708': {
			lat: 15,
			hops: 1,
			ts: '2024-02-14T10:53:36.676Z',
			qos: 0,
		},
		'187716906': {
			lat: 23,
			hops: 2,
			ts: '2024-02-07T17:11:51.560Z',
			qos: 1,
		},
		'668042124': {
			lat: 125,
			hops: 2,
			ts: '2024-02-07T17:11:51.693Z',
			qos: 1,
		},
		'700439505': {
			lat: 101,
			hops: 1,
			ts: '2024-02-07T17:11:51.282Z',
			qos: 1,
		},
		'869048513': {
			lat: 70,
			hops: 1,
			ts: '2024-02-07T17:11:54.420Z',
			qos: 1,
		},
		'874623656': {
			lat: 140,
			hops: 1,
			ts: '2024-02-07T17:11:50.558Z',
			qos: 1,
		},
		'908464740': {
			lat: 54,
			hops: 1,
			ts: '2024-02-14T10:53:49.912Z',
			qos: 1,
		},
		'1091208764': {
			lat: 54,
			hops: 1,
			ts: '2024-02-07T17:11:51.250Z',
			qos: 1,
		},
		'1137147579': {
			lat: 101,
			hops: 1,
			ts: '2024-02-07T17:11:53.606Z',
			qos: 1,
		},
		'1149442443': {
			lat: 101,
			hops: 1,
			ts: '2024-02-07T17:11:52.930Z',
			qos: 1,
		},
		'1162209470': {
			lat: 70,
			hops: 2,
			ts: '2024-02-07T17:11:51.098Z',
			qos: 1,
		},
		'1340818662': {
			lat: 62,
			hops: 1,
			ts: '2024-02-07T17:11:52.564Z',
			qos: 1,
		},
		'1520360476': {
			lat: 140,
			hops: 2,
			ts: '2024-02-07T17:11:52.001Z',
			qos: 1,
		},
		'1579978731': {
			lat: 70,
			hops: 2,
			ts: '2024-02-07T17:11:53.272Z',
			qos: 1,
		},
		'1608885929': {
			lat: 101,
			hops: 2,
			ts: '2024-02-07T17:11:51.135Z',
			qos: 1,
		},
		'1653168019': {
			lat: 62,
			hops: 2,
			ts: '2024-02-07T17:11:52.342Z',
			qos: 1,
		},
		'1701643315': {
			lat: 93,
			hops: 1,
			ts: '2024-02-07T17:11:53.778Z',
			qos: 1,
		},
		'1858806218': {
			lat: 70,
			hops: 2,
			ts: '2024-02-07T17:11:54.432Z',
			qos: 1,
		},
		'1859113972': {
			lat: 15,
			hops: 1,
			ts: '2024-02-07T17:11:50.664Z',
			qos: 1,
		},
		'2009202270': {
			lat: 132,
			hops: 2,
			ts: '2024-02-07T17:11:50.110Z',
			qos: 1,
		},
		'2009570943': {
			lat: 62,
			hops: 2,
			ts: '2024-02-07T17:11:52.240Z',
			qos: 1,
		},
		'2087508998': {
			lat: 46,
			hops: 1,
			ts: '2024-02-07T17:11:52.898Z',
			qos: 1,
		},
		'2096248243': {
			lat: 109,
			hops: 2,
			ts: '2024-02-07T17:11:50.911Z',
			qos: 1,
		},
	})

	return (
		<div class="container">
			<div class="row">
				<main class="col-8">
					<div class="m-2">
						<WirepasTopologyDiagram
							connections={parsedWirepasTopology}
							showHelpers
							size={{ width: 500, height: 500 }}
						/>
					</div>
				</main>
				<aside class="col-4 text-white">
					<pre class="m-4">
						{JSON.stringify(parsedWirepasTopology, null, 2)}
					</pre>
				</aside>
			</div>
		</div>
	)
}
