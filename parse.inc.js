const join = require('./join')
const snuggle = require('./snuggle')
const unpackAll = require('./unpack')
const $ = require('programmatic')

function generate (packet) {
    let step = 0, index = -1, _conditional = false

    function integer (path, field) {
        const bytes = field.bits / 8
        if (bytes == 1) {
            return $(`
                case ${step++}:

                    $step = ${step}

                case ${step++}:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    ${path} = $buffer[$start++]

            `)
        }
        const start = field.endianess == 'big' ? 0 : bytes - 1
        const stop = field.endianess == 'big' ? bytes - 1 : -1
        const direction = field.little ? '++' : '--'
        return $(`
            case ${step++}:

                $_ = 0
                $step = ${step}
                $byte = ${start}

            case ${step++}:

                while ($byte != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += $buffer[$start++] << $byte * 8 >>> 0
                    $byte${direction}
                }

                ${path} = $_

        `)
    }

    function vivify (packet) {
        const fields = []
        // TODO Not always a structure, sometimes it is an object.
        if (packet.type == 'structure') {
            packet.fields.forEach(function (packet) {
                switch (packet.type) {
                case 'literal':
                    break
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

    function lengthEncoding (path, field) {
        index++
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        return $(`
            `, integer([ I ], field), `
                ${i} = 0
        `)
    }

    function lengthEncoded (path, packet) {
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        // var integer = integer(packet.length, 'length')
        // Invoked here to set `again`.
        const again = step
        const source = $(`
            `, dispatch([ `${path}[${i}]` ], packet.element), `
                if (++${i} != ${I}) {
                    $step = ${again}
                    continue
                }
        `)
        index--
        return source
    }

    function literal (packet) {
        return $(`
            case ${step++}:

                $_ = ${packet.value.length / 2}
                $step = ${step}

            case ${step++}:

                $byte = Math.min($end - $start, $_)
                $_ -= $byte
                $start += $byte

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }
        `)
    }

    function conditional (path, conditional) {
        _conditional = true
        const { parse } = conditional
        const sip = join(parse.sip.map(field => {
            return dispatch('$sip[0]', field)
        }))
        const start = step++
        const steps = []
        for (const condition of parse.conditions) {
            steps.push({
                number: step,
                source: join(condition.fields.map(field => dispatch(path, field)))
            })
        }
        const ladder = []
        for (let i = 0, I = parse.conditions.length; i < I; i++) {
            const condition = parse.conditions[i]
            const keyword = typeof condition.source == 'boolean' ? 'else'
                                                               : i == 0 ? 'if' : 'else if'
            ladder.push($(`
                ${keyword} ((${condition.source})($sip[0], ${path}, ${packet.name})) {
                    $step = ${steps[i].number}
                    continue
                }
            `))
        }
        const done = $(`
            $step = ${step}
            continue
        `)
        return $(`
            `, sip, `

            case ${start}:

                `, snuggle(ladder), `

            `, join(steps.map((step, i) => {
                return $(`
                    `, step.source, `

                        `, steps.length - 1 != i ? done : null, `
                `)
            })), `
        `)
    }

    function dispatch (path, packet, depth, arrayed) {
        switch (packet.type) {
        case 'structure':
            const push = $(`
                case ${step++}:

                    ${path} = {
                        `, vivify(packet, 0), `
                    }
                    $step = ${step}

            `)
            const source =  join(packet.fields.map(field => dispatch(path + field.dotted, field)))
            return $(`
                `, push, `
                `, source, `
            `)
        case 'conditional':
            return conditional(path, packet)
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path, packet)
        case 'function':
            return $(`
                case ${step++}:

                    ${path} = (${packet.source})($sip[0])
            `)
        case 'literal':
            return literal(packet)
        }
    }

    let source = $(`
        switch ($step) {
        `, dispatch([ packet.name ], packet, 0), `

        case ${step}:

            return { start: $start, object: ${packet.name}, parse: null }
        }
    `)

    const lets = [ '$_', '$byte' ]
    const signature = [ `${packet.name} = {}`, '$step = 0' ]
    if (packet.lengthEncoded || _conditional) {
        signature.push('$i = []', '$I = []')
        if (_conditional) {
            signature.push('$sip = []')
        }
        source = $(`
            for (;;) {
                `, source, `
                break
            }
        `)
    }

    // TODO Vivify through a funciton so that `object = vivify()`.
    // TOOO Write directly to object, I think, get rid of `$_`?
    const object = `parsers.inc.${packet.name}`
    return $(`
        ${object} = function (${signature.join(', ')}) {
            let ${lets.join(', ')}
            return function parse ($buffer, $start, $end) {
                `, source, `
            }
        }
    `)
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
