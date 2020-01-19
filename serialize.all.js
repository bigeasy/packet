const join = require('./join')
const pack = require('./pack')
const $ = require('programmatic')

function bff (path, packet, arrayed) {
    let checkpoint
    const fields = [ checkpoint = { type: 'checkpoint', lengths: [ 0 ] } ]
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = JSON.parse(JSON.stringify(packet.fields[i]))
        switch (field.type) {
        case 'lengthEncoding':
            checkpoint.lengths[0] += field.bits / 8
            break
        case 'lengthEncoded':
            switch (field.element.type) {
            case 'structure':
                field.element.fields = bff(path.concat(packet.name), field.element, true)
                break
            default:
                checkpoint.lengths.push(`${field.element.bits / 8} * ${path.concat(field.name).join('.')}.length`)
                break
            }
            break
        default:
            checkpoint.path = path.concat(packet.name)
            checkpoint.lengths[0] += field.bits / 8
            break
        }
        fields.push(field)
    }
    return fields
}

function generate (packet, bff) {
    let step = 0
    let index = -1
    const constants = {}

    function buffer (field) {
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

    function _pack (field, object, stuff = 'let value') {
        const preface = []
        const packing = []
        let offset = 0
        for (let i = 0, I = field.fields.length; i < I; i++) {
            const packed = field.fields[i]
            switch (packed.type) {
            case 'integer': {
                    let variable = object + '.' + packed.name
                    if (packed.indexOf) {
                        constants.other = packed.indexOf
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
                                    `, _pack(when, object, 'flags'), `
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

    function integer (packet, field) {
        step += 2
        if (field.fields) {
            const pack = _pack(field, '$_')
            return $(`
                {
                    `, pack, `

                    `, word(field, 'value'), `
                }
            `)
        } else {
            return $(`
                $_ = ${packet.type == 'lengthEncoded' ? '$element' : packet.name}.${field.name}

                `, word(field, '$_'), `
            `)
        }
    }

    // TODO How do I inject code?
    function word (field, variable) {
        const bytes = field.bits / 8
        let bite = field.endianness == 'little' ? 0 : bytes - 1
        const stop = field.endianness == 'little' ? bytes : -1
        const direction = field.endianness == 'little' ? 1 : -1
        const shifts = []
        while (bite != stop) {
            const shift = bite ? variable + ' >>> ' + bite * 8 : variable
            shifts.push(`$buffer[$start++] = ${shift} & 0xff`)
            bite += direction
        }
        return shifts.join('\n')
    }

    function lengthEncoding (packet, parent) {
        return word(packet, `${parent.name}.${packet.name}.length`)
    }

    function lengthEncoded (packet, parent) {
        const i = `$i[${++index}]`
        const looped = word(packet.element, `${parent.name}.${packet.name}[${i}]`)
        const source = $(`
            for (${i} = 0; ${i} < ${parent.name}.${packet.name}.length; ${i}++) {
                `, looped, `
            }
        `)
        index--
        return source
    }

    function checkpoint (checkpoint) {
        const i = packet.lengthEncoded ? '$i' : '[]'
        return $(`
            if ($end - $start < ${checkpoint.lengths.join(' + ')}) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(${root}, ${step}, ${i})
                }
            }
        `)
    }

    function _condition (packet, arrayed) {
        let branches = '', test = 'if'
        packet.conditions.forEach(function (condition) {
            const block = join(condition.fields.map(packet => {
                return field(packet, arrayed)
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

    function field (packet, parent) {
        switch (packet.type) {
        case 'checkpoint':
            // TODO `variables` can be an object member.
            return checkpoint(packet, packet.arrayed)
        case 'compressed':
            const compression = []
            let first = true
            for (let i = 0, I = packet.serialize.length; i < I; i++) {
                const serialize = packet.serialize[i]
                if (i < I - 1) {
                    compression.push($(`

                        bits = (${serialize.value})(value)
                        value = (${serialize.advance})(value)

                        `, word(serialize, 'bits'), `

                        if ((${serialize.done})(value)) {
                            break
                        }
                    `))
                } else {
                    compression.push($(`

                        bits = (${serialize.value})(value)
                        value = (${serialize.advance})(value)

                        `, word(serialize, 'bits'), `
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
            return _condition(packet, packet.arrayed)
        case 'structure':
            const source = join(packet.fields.map(field => {
                return field(field, parent)
            }))
            return $(`
                {
                    let ${packet.name} = object.${packet.name}

                    `, source, `
                }
            `)
            break
        case 'lengthEncoding':
            return lengthEncoding(packet, parent)
        case 'lengthEncoded':
            return lengthEncoded(packet, parent)
        case 'buffer':
            return buffer(packet)
        case 'integer':
            return integer(parent, packet)
        }
    }

    const root = packet.name
    const source = join(packet.fields.map(f => {
        return field(f, packet)
    }))
    var variables = [ '$_' ]
    if (packet.lengthEncoded) {
        variables.push('$i = []')
    }
    return $(`
        serializers.${bff ? 'bff' : 'all'}.${packet.name} = function (${packet.name}) {
            return function ($buffer, $start, $end) {
                let ${variables.join(', ')}

                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
}

module.exports = function (compiler, definition, options = {}) {
    const source = join(JSON.parse(JSON.stringify(definition)).map(function (packet) {
        if (options.bff) {
            packet.fields = bff([ packet.name ], packet)
        }
        return generate(packet, options.bff)
    }))
    return compiler(source)
}
