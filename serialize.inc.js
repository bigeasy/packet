const $ = require('programmatic')
const join = require('./join')

function generate (packet) {
    let step = 0, index = -1, isLengthEncoded = packet.lengthEncoded

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

    function lengthEncoding (path, packet) {
        index++
        return $(`
            `, integer(path.concat('length'), packet.length), `
                $i.push(0)
        `)

    }

    function lengthEncoded (path, packet) {
        const i = `$i[${index}]`
        const I = `$I[${index}]`
        index--
        const again = step
        return $(`
            `, field([ `${path.join('.')}[${i}]` ], packet.element), `

                if (++${i} != ${path.concat('length').join('.')}) {
                    $step = ${again}
                    continue
                }

                $i.pop()
        `)
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
        case 'lengthEncoding':
            return lengthEncoding(path, packet)
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

            break

        }
    `)
    if (isLengthEncoded) {
        dispatch = $(`
            for (;;) {
                `, dispatch, `

                break
            }
        `)
    }
    const object = 'serializers.inc.' + packet.name
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

const bogus = require('./bogus')

module.exports = function (compiler, definition) {
    return compiler(join(JSON.parse(JSON.stringify(definition)).map(packet => generate(bogus(packet)))))
}
