var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var pack = require('./pack')
var $ = require('programmatic')

const Indices = require('./indices')

function Generator () {
    this.step = 0
    this.constants = {}
    this.indices = new Indices
}

Generator.prototype.buffer = function (field) {
    if (field.transform) {
        return $(`
            ${value} = new Buffer(${object}.${field.name}, ${JSON.stringify(field.transform)})
            for (var ${index} = 0, ${end} = ${value}.length; ${index} < ${end}; ${index}++) {
                $buffer[start++] = ${value}[${index}]
            }
            ${value} = ${JSON.stringify(field.terminator)}
            for (var ${index} = 0, ${end} = ${value}.length; ${index} < ${end}; ${index}++) {
                $buffer[start++] = ${value}[${index}]
            }
        `)
    }
}

Generator.prototype._pack = function (field, object, stuff = 'let value') {
        const preface = []
        const packing = []
        let offset = 0
        for (let i = 0, I = field.fields.length; i < I; i++) {
            const packed = field.fields[i]
            switch (packed.type) {
            case 'integer': {
                    let variable = object + '.' + packed.name
                    if (packed.indexOf) {
                        this.constants.other = packed.indexOf
                        variable = `other.indexOf[${object}.${packed.name}]`
                    }
                    packing.push(' (' + pack(field.bits, offset, packed.bits, variable) + ')')
                    offset += packed.bits
                }
                break
            case 'switch': {
                    const cases = []
                    for (const when of packed.when) {
                        if ('literal' in when) {
                            cases.push($(`
                                case ${JSON.stringify(when.value)}:
                                    ${packed.name} = ${JSON.stringify(when.literal)}
                                    break
                            `))
                        } else {
                            cases.push($(`
                                case ${JSON.stringify(when.value)}:
                                    `, this._pack(when, object, 'flags'), `
                                    break
                            `))
                        }
                    }
                    preface.push($(`
                        let ${packed.name}
                        switch ((${packed.value})(object)) {
                        `, cases.join('\n'), `
                        }
                    `))
                    packing.push(` (${pack(4, offset, packed.bits, packed.name)})`)
                }
                break
            }
        }
        if (preface.length) {
            return $(`
                `, preface.join('\n'), `

                ${stuff} =
                    `, packing.join(' |\n'), `
            `)
        }
        return $(`
            ${stuff} =
                `, packing.join(' |\n'), `
        `)
}

Generator.prototype.integer = function (packet, field) {
    this.step += 2
    if (field.fields) {
        const pack = this._pack(field, '$_')
        return $(`
            {
                `, pack, `

                `, this.word(field, 'value'), `
            }
        `)
    } else {
        return $(`
            $_ = ${packet.type == 'lengthEncoded' ? '$element' : packet.name}.${field.name}

            `, this.word(field, '$_'), `
        `)
    }
}

// TODO How do I inject code?
Generator.prototype.word = function (field, variable) {
    const shifts = []
    const endianness = field.endianness == null || field.endianness[0] == 'b' ? 'big' : 'little'
    const bytes = field.bits / 8
    const direction = endianness == 'little' ? 1 : -1
    let stop = endianness == 'little' ? bytes : -1
    let bite = endianness == 'little' ? 0 : bytes - 1
    let shift
    while (bite != stop) {
        shift = bite ? variable + ' >>> ' + bite * 8 : variable
        shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
        bite += direction
    }
    return shifts.join('\n')
}

Generator.prototype.lengthEncoded = function (packet, parent) {
    this.step += 2
    const index = this.indices.push()
    this._lengthEncoded = true
    var source = ''
    const looped = joinSources(packet.element.fields.map(field => {
        return this.field(field, packet)
    }))
    source = $(`
        let $array = object.${packet.name}

        `, this.word(packet.length, '$array.length'), `

        for (let ${index} = 0; ${index} < $array.length; ${index}++) {
            let $element = $array[${index}]

            `, looped, `
        }
    `)
    this.indices.pop()
    return source
}

Generator.prototype.checkpoint = function (packet, arrayed) {
    const indices = this.indices.stack.length == 0 ? '[]' : `[ ${this.indices.stack.join(', ')} ]`
    return $(`
        if ($end - $start < ${packet.length}) {
            return {
                start: $start,
                serialize: serializers.inc.object(${this.root}, ${this.step}, ${indices})
            }
        }
    `)
}

Generator.prototype._condition = function (packet, arrayed) {
    var branches = '', test = 'if'
    packet.conditions.forEach(function (condition) {
        var block = joinSources(condition.fields.map(packet => {
            return this.field(packet, arrayed)
        }))
        test = condition.test == null  ? '} else {' : test + ' (' + condition.test + ') {'
        branches = $(`
            `, branches, `
            ${test}
                `, block, `
        `)
        test = '} else if'
    }, this)
    return $(`
        `, branches, `
        }
    `)
}

Generator.prototype.field = function (packet, parent) {
    switch (packet.type) {
    case 'checkpoint':
        // TODO `variables` can be an object member.
        return this.checkpoint(packet, packet.arrayed)
    case 'compressed':
        const compression = []
        let first = true
        for (let i = 0, I = packet.serialize.length; i < I; i++) {
            const serialize = packet.serialize[i]
            if (i < I - 1) {
                compression.push($(`

                    bits = (${serialize.value})(value)
                    value = (${serialize.advance})(value)

                    `, this.word(serialize, 'bits'), `

                    if ((${serialize.done})(value)) {
                        break
                    }
                `))
            } else {
                compression.push($(`

                    bits = (${serialize.value})(value)
                    value = (${serialize.advance})(value)

                    `, this.word(serialize, 'bits'), `
                `))
            }
        }
        return $(`
            do {
                value = object.${packet.name}

                let bits
                `, compression.join('\n'), `
            } while(false)
        `)
        break
    case 'condition':
        return this._condition(packet, packet.arrayed)
    case 'structure':
        var source = joinSources(packet.fields.map(field => {
            return this.field(field, parent)
        }))
        return $(`
            {
                let ${packet.name} = object.${packet.name}

                `, source, `
            }
        `)
        break
    case 'lengthEncoded':
        return this.lengthEncoded(packet, parent)
    case 'buffer':
        return this.buffer(packet)
    case 'integer':
        return this.integer(parent, packet)
    }
}

Generator.prototype.serializer = function (packet, bff) {
    this.root = packet.name
    const source = joinSources(packet.fields.map(field => {
        return this.field(field, packet)
    }))
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            return function ($buffer, $start, $end) {
                let $_

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

function bff (path, packet, arrayed) {
    var checkpoint, fields = [ checkpoint = { type: 'checkpoint', length: 0 } ]
    for (var i = 0, I = packet.fields.length; i < I; i++) {
        var field = JSON.parse(JSON.stringify(packet.fields[i]))
        switch (field.type) {
        case 'lengthEncoded':
            checkpoint.length += field.length.bits / 8
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(path.concat(packet.name), field.element, true)
                break
            default:
                throw new Error
            }
            break
        default:
            checkpoint.path = path.concat(packet.name)
            checkpoint.length += field.bits / 8
            checkpoint.arrayed = !! arrayed
            break
        }
        fields.push(field)
    }
    return fields
}

module.exports = function (compiler, definition, options) {
    // TODO Options is required.
    options || (options = {})
    var source = joinSources(definition.map(function (packet) {
        packet = explode(packet)
        if (options.bff) {
            packet.fields = bff([], packet)
        }
        const generated = new Generator().serializer(packet, options.bff)
        return generated
    }))
    return compiler(source)
}
