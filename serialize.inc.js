var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var $ = require('programmatic')
var joinSources = require('./join-sources')

class Generator {
    constructor () {
        this.step = 0
        this._lets = []
        this._i = -1
    }

    integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = endianness[0] == 'l' ? '++' : '--'
        let step = this.step
        let bite = endianness[0] == 'l' ? 0 : bytes - 1
        let stop = endianness[0] == 'l' ? bytes : -1
        const source = $(`
            case ${this.step++}:

                $step = ${this.step}
                $bite = ${bite}
                $_ = ${path.join('.')}

            case ${this.step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                    $bite${direction}
                }

        `)
        return { step: step, source: source }
    }

    lengthEncoded (path, packet) {
        this._i++
        var source = ''
        this.forever = true
        this.indexed = true
        var step = this.step
        var again = this.step + 2
        this._lets.push(packet.name)
        source = $(`
            `, this.integer(path.concat(packet.name, 'length'), packet.length, 'frame.object.' + packet.name + '.length').source, `
                $i.push(0)

            `, this.field(path.concat(`${packet.name}[$i[${this._i}]]`), packet.element), `

                if (++$i[${this._i}] != ${path.concat(packet.name).join('.')}.length) {
                    $step = ${again}
                    continue SERIALIZE
                }

                $i.pop()
        `)
        this._i--
        return { step: step, source: source }
    }

    field (path, packet) {
        switch (packet.type) {
        case 'structure':
            return joinSources(packet.fields.map(function (field) {
                const source = this.field(packet.name ? path.concat(packet.name) : path, field).source
                return $(`
                    `, source, `
                `)
            }.bind(this)))
        case 'lengthEncoded':
            return this.lengthEncoded(path, packet)
        default:
            if (packet.type === 'integer')  {
                return this.integer(path.concat(packet.name), packet)
            }
        }
    }

    serializer (packet) {
        const path = [ packet.name ]
        const source = this.field([], packet)
        let dispatch = $(`
            switch ($step) {
            `, source, `

                $step = ${this.step}

            case ${this.step}:

                break${this.forever ? ' SERIALIZE' : ''}

            }
        `)
        if (this.forever) {
            dispatch = $(`
                SERIALIZE: for (;;) {
                    `, dispatch, `
                }
            `)
        }
        const object = 'serializers.inc.' + packet.name
        let lets = null && this._lets.length > 0 ? $(`
            let ${this._lets.join(', ')}

        `) : null
        const generated = $(`
            ${object} = function (${packet.name}, $step, $i) {
                let $bite, $stop, $_

                `, lets, `
                return function serialize ($buffer, $start, $end) {
                    `, dispatch, `

                    return { start: $start, serialize: null }
                }
            }
        `)
        console.log(generated)
        return generated
    }
}

module.exports = function (compiler, definition) {
    var source = joinSources(definition.map(function (packet) {
        return new Generator().serializer(packet)
    }))
    return compiler(source)
}
