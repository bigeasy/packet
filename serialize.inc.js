const $ = require('programmatic')
const join = require('./join')

function generate (packet) {
    let step = 0, index = -1

    function integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = endianness[0] == 'l' ? '++' : '--'
        let bite = endianness[0] == 'l' ? 0 : bytes - 1
        let stop = endianness[0] == 'l' ? bytes : -1
        const source = $(`
            case ${step++}:

                $step = ${step}
                $byte = ${bite}
                $_ = ${path.join('.')}

            case ${step++}:

                while ($byte != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $byte * 8 & 0xff
                    $byte${direction}
                }

        `)
        return source
    }

    function lengthEncoding (path, packet) {
        index++
        return $(`
            `, integer(path.concat('length'), packet), `
                $i.push(0)
        `)

    }

    function lengthEncoded (path, packet) {
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        const again = step
        const source = $(`
            `, dispatch([ `${path.join('.')}[${i}]` ], packet.element), `

                if (++${i} != ${path.concat('length').join('.')}) {
                    $step = ${again}
                    continue
                }

                $i.pop()
        `)
        index--
        return source
    }

    function literal (packet) {
        const bytes = []
        for (let i = 0, I = packet.value.length; i < I; i += 2) {
            bytes.push(parseInt(packet.value.substring(i, i + 2), 16))
        }
        return $(`
            case ${step++}:

                $step = ${step}
                $byte = 0
                $_ = ${JSON.stringify(bytes)}

            case ${step++}:

                while ($byte != ${packet.value.length / 2}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_[$byte++]
                }

        `)
    }

    function dispatch (path, packet) {
        switch (packet.type) {
        case 'structure':
            return join(packet.fields.map(field => {
                const source = dispatch(field.name ? path.concat(field.name) : path, field)
                return $(`
                    `, source, `
                `)
            }))
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'literal':
            return literal(packet)
        case 'integer':
            return integer(path, packet)
        }
    }

    let source = $(`
        switch ($step) {
        `, dispatch([ packet.name ], packet), `

            $step = ${step}

        case ${step}:

            break

        }
    `)
    if (packet.lengthEncoded) {
        source = $(`
            for (;;) {
                `, source, `

                break
            }
        `)
    }
    const object = 'serializers.inc.' + packet.name
    const generated = $(`
        ${object} = function (${packet.name}, $step = 0, $i = []) {
            let $byte, $stop, $_

            return function serialize ($buffer, $start, $end) {
                `, source, `

                return { start: $start, serialize: null }
            }
        }
    `)
    return generated
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
