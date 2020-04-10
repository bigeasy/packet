const join = require('./join')
const unpackAll = require('./unpack')
const $ = require('programmatic')

function generate (packet) {
    let step = 0, index = -1

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
            `, dispatch([ `${path.join('.')}[${i}]` ], packet.element), `
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

                $bite = Math.min($end - $start, $_)
                $_ -= $bite
                $start += $bite

                if ($_ != 0) {
                    return { start: $start, object: null, parse }
                }
        `)
    }

    function dispatch (path, packet, depth, arrayed) {
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
                return dispatch(f.name ? path.concat(f.name) : path, f)
            }.bind(this)))
            return $(`
                `, push, `
                `, source, `
            `)
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path, packet)
        case 'literal':
            return literal(packet)
        }
    }

    let source = $(`
        switch ($step) {
        `, dispatch([ packet.name ], packet, 0), `
            return { start: $start, object: ${packet.name}, parse: null }
        }
    `)

    const lets = [ '$_', '$bite' ]
    const signature = [ `${packet.name} = {}`, '$step = 0' ]
    if (packet.lengthEncoded) {
        signature.push('$i = []', '$I = []')
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
