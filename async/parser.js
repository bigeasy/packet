const stream = require('stream')
const { Staccato } = require('staccato')

class Parser {
    constructor (definition, stream) {
        this._staccato = new Staccato(stream)
        this._definition = definition
        this._buffer = Buffer.alloc(0)
        this._start = 0
    }

    async read (defintion) {
        let parser = this._definition.parser.bff[defintion]()
        for (;;) {
            if (this._buffer.length == this._start) {
                this._buffer = await this._staccato.readable.read()
                this._start = 0
            }
            const { start, object, parse } = parser(this._buffer, this._start, this._buffer.length)
            this._start = start
            if (object != null) {
                return object
            }
            parser = parse
        }
    }
}

const through = new stream.PassThrough

async function parse () {
    const parser = new Parser(require('../generated'), through)
    const first = await parser.read('first')
    console.log(first.value.toString(16))
}

parse()

const buffer = Buffer.from([ 0xaa, 0xaa ])
through.write(buffer)
