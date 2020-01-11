const join = require('./join')
const unpackAll = require('./unpack')
const $ = require('programmatic')

function generate (packet) {
    let step = 0
    const variables = []

    function read (field) {
    }

    function integer (path, field) {
        const bytes = field.bits / 8

        variables.push('$_', '$bite')

        if (bytes == 1) {
            return $(`
                case ${step++}:

                    $step = ${step}

                case ${step++}:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    ${path.join('.')} = $buffer[$start++]

            `)
        }
        const start = field.endianess == 'big' ? 0 : bytes - 1
        const stop = field.endianess == 'big' ? bytes - 1 : -1
        const direction = field.little ? '++' : '--'
        return $(`
            case ${step++}:

                $_ = 0
                $step = ${step}
                $bite = ${start}

            case ${step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $bite * 8 >>> 0
                    $bite${direction}
                }

                ${path.join('.')} = $_

        `)
    }

    function vivify (packet) {
        const fields = []
        // TODO Not always a structure, sometimes it is an object.
        if (packet.type == 'structure') {
            packet.fields.forEach(function (packet) {
                switch (packet.type) {
                case 'integer':
                    if (packet.name) {
                        fields.push(packet.name + ': 0')
                    } else if (packet.fields) {
                        packet.fields.forEach(function (packet) {
                            fields.push(packet.name + ': null')
                        })
                    }
                    break
                case 'lengthEncoded':
                    fields.push(packet.name + ': new Array')
                    break
                }
            }, this)
        } else {
            throw new Error('to do')
        }
        return fields.join(',\n')
    }

    function lengthEncoded (packet, depth) {
        var source = ''
        this.forever = true
        var integer = this.integer(packet.length, 'length')
        var again = this.step
        source = $(`
            `, integer.source, `

                this.stack[this.stack.length - 1].index = 0
            `, this.field(packet.element, depth, true).source, `

                frame = this.stack[this.stack.length - 2]
                frame.object.${packet.name}.push(this.stack.pop().object)
                if (++frame.index != frame.length) {
                    this.step = ${again}
                    continue
                }
                this.step = ${this.step}

        `)
        return {
            step: integer.step,
            source: source
        }
    }

    function field (path, packet, depth, arrayed) {
        switch (packet.type) {
        case 'structure':
            const push = $(`
                case ${step++}:

                    ${path.join('.')} = {
                        `, vivify(packet, 0), `
                    }
                    $step = ${step}

            `)
            const source =  join(packet.fields.map(function (f) {
                return field(f.name ? path.concat(f.name) : path, f)
            }.bind(this)))
            return $(`
                `, push, `
                `, source, `
            `)
        case 'condition':
            return this.condition(packet)
        case 'lengthEncoded':
            return this.lengthEncoded(packet)
        case 'integer':
            return integer(path, packet)
        }
    }

    const source = field([ packet.name ], packet, 0)
    const dispatch = $(`
        switch ($step) {
        `, source, `
            return { start: $start, object: ${packet.name}, parse: null }
        }
    `)

    if (this.forever) {
        dispatch = $(`
            PARSE: for (;;) {

                `, dispatch, `

                break
            }
        `)
    }
    const lets = variables.length != 0 ? $(`
        let ${variables.filter((item, index) => variables.indexOf(item) == index).join(', ')}
    `) : null
    const object = `parsers.inc.${packet.name}`
    return $(`
        ${object} = function (${packet.name} = null, $step = 0, $i = []) {
            `, lets, `
            return function parse ($buffer, $start, $end) {
                `, dispatch, `
            }
        }
    `)
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
