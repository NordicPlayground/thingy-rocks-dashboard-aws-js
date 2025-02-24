export class Bytestream {
	private pos = 0
	private readonly EOL: string
	public readonly data: string
	constructor(data: string, EOL = '\n') {
		this.data = data
		this.EOL = EOL
	}

	peek(): string | undefined {
		return this.data[this.pos]
	}
	seek(pos: number): void {
		this.pos = pos
	}

	next(): string | undefined {
		return this.data[this.pos++]
	}

	isEOF(): boolean {
		return this.pos >= this.data.length
	}

	readLine(): string {
		const line = []
		while (this.peek() !== this.EOL && !this.isEOF()) line.push(this.next())
		this.next()
		return line.join('')
	}

	current(): number {
		return this.pos
	}
}
