import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Bytestream } from './Bytestream.js'

void describe('Bytestream', () => {
	void it('should return the next character in the string without advancing the position when calling peek()', () => {
		const data = 'test data'
		const bytestream = new Bytestream(data)
		assert.equal(bytestream.peek(), 't')
		assert.equal(bytestream.current(), 0)
	})

	void it('should return the next character in the string and advance the position when calling next()', () => {
		const data = 'test data'
		const bytestream = new Bytestream(data)
		assert.equal(bytestream.next(), 't')
		assert.equal(bytestream.current(), 1)
	})

	void it('should return true when the position is at the end of the data string', () => {
		const bytestream = new Bytestream('data')
		bytestream.seek(4)
		assert.equal(bytestream.isEOF(), true)
	})

	void it('should return lines from the stream', () => {
		const bytestream = new Bytestream('Hello\nWorld')
		const line1 = bytestream.readLine()
		const line2 = bytestream.readLine()
		assert.equal(line1, 'Hello')
		assert.equal(line2, 'World')
	})
})
