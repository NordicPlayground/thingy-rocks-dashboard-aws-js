import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { parseTopology } from './parseTopology.js'

void test('Topology parsing should handle sink-to-leaf connections', () => {
	const topologyString = [
		'38*:Sink',
		'41:Client',
		'39:Relay',
		'40:Client',
		'41----->38',
		'39--->38',
		'40->39',
	].join('\n')

	const parsed = parseTopology(topologyString)

	// Should have one sink node
	const sinks = parsed.nodes.filter((n) => n.sink)
	assert.equal(sinks.length, 1)
	assert.equal(sinks[0]?.id, 38)

	// Should have connections TO the sink (neighbors that sink can see)
	const toSink = parsed.connections.filter((c) => c.to === 38)
	assert.equal(toSink.length, 2) // 41->38 and 39->38

	// Should find nodes 41 and 39 as neighbors
	const neighborIds = toSink.map((c) => c.from).sort((a, b) => a - b)
	assert.deepEqual(neighborIds, [39, 41])
})
