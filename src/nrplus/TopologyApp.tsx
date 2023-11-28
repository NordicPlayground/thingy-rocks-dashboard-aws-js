import { useState } from 'preact/hooks'
import { parseTopology } from './parseTopology.js'
import '../../static/base.css'
import { NRPlusTopology } from './NRPlusTopology.js'

export const App = () => {
	const [topology, setTopology] = useState<string>(
		[
			`38*:Sink`,
			`41:Client`,
			`39:Relay`,
			`40:Client`,
			`41----->38`,
			`39--->38`,
			`40->39`,
		].join('\n'),
	)

	const parsedTopology = parseTopology(topology)

	return (
		<div class="container">
			<div class="row">
				<main class="col-4">
					<div class="m-4">
						<NRPlusTopology
							topology={parsedTopology}
							size={{ width: 250, height: 150 }}
							showHelpers
						/>
						<div class="mt-4">
							<textarea
								onInput={(e) =>
									setTopology((e.target as HTMLInputElement).value)
								}
								value={topology}
								rows={topology.split('\n').length}
								cols={Math.max(...topology.split('\n').map((s) => s.length))}
							></textarea>
						</div>
					</div>
				</main>
				<aside class="col-8 text-white">
					<pre class="m-4">
						{JSON.stringify({ topology: parsedTopology }, null, 2)}
					</pre>
				</aside>
			</div>
		</div>
	)
}
