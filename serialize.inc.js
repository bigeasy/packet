const $ = require('programmatic')
const join = require('./join')

function generate (packet) {
    let step = 0, _lets = [], index = -1, isLengthEncoded = packet.lengthEncoded, indexed = false

    function integer (path, field) {
        const endianness = field.endianness || 'big'
        const bytes = field.bits / 8
        const direction = endianness[0] == 'l' ? '++' : '--'
        let bite = endianness[0] == 'l' ? 0 : bytes - 1
        let stop = endianness[0] == 'l' ? bytes : -1
        const source = $(`
            case ${step++}:

                $step = ${step}
                $bite = ${bite}
                $_ = ${path.join('.')}

            case ${step++}:

                while ($bite != ${stop}) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                    $bite${direction}
                }

        `)
        return source
    }

    function lengthEncoded (path, packet) {
        index++
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        let source = ''
        indexed = true
        const again = step + 2
        _lets.push(packet.name)
        source = $(`
            `, integer(path.concat('length'), packet.length), `
                $i.push(0)

            `, field([ `${path.join('.')}[${i}]` ], packet.element), `

                if (++${i} != ${path.concat('length').join('.')}) {
                    $step = ${again}
                    continue SERIALIZE
                }

                $i.pop()
        `)
        index--
        return source
    }

    function field (path, packet) {
        switch (packet.type) {
        case 'structure':
            return join(packet.fields.map(f => {
                const source = field(f.name ? path.concat(f.name) : path, f)
                return $(`
                    `, source, `
                `)
            }))
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path, packet)
        }
    }

    const source = field([ packet.name ], packet)
    let dispatch = $(`
        switch ($step) {
        `, source, `

            $step = ${step}

        case ${step}:

            break${isLengthEncoded ? ' SERIALIZE' : ''}

        }
    `)
    if (isLengthEncoded) {
        dispatch = $(`
            SERIALIZE: for (;;) {
                `, dispatch, `
            }
        `)
    }
    const object = 'serializers.inc.' + packet.name
    let lets = null && _lets.length > 0 ? $(`
        let ${_lets.join(', ')}

    `) : null
    const generated = $(`
        ${object} = function (${packet.name}, $step = 0, $i = []) {
            let $bite, $stop, $_

            `, lets, `
            return function serialize ($buffer, $start, $end) {
                `, dispatch, `

                return { start: $start, serialize: null }
            }
        }
    `)
    return generated
}

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(packet))))
}
