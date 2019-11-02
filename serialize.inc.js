var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var $ = require('programmatic')
var join = require('./join-sources')

function generate (packet) {
    let step = 0, _lets = [], _i = -1, forever = false, indexed = false

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
        _i++
        var source = ''
        forever = true
        indexed = true
        var again = step + 2
        _lets.push(packet.name)
        source = $(`
            `, integer(path.concat(packet.name, 'length'), packet.length, 'frame.object.' + packet.name + '.length'), `
                $i.push(0)

            `, field(path.concat(`${packet.name}[$i[${_i}]]`), packet.element), `

                if (++$i[${_i}] != ${path.concat(packet.name).join('.')}.length) {
                    $step = ${again}
                    continue SERIALIZE
                }

                $i.pop()
        `)
        _i--
        return source
    }

    function field (path, packet) {
        switch (packet.type) {
        case 'structure':
            return join(packet.fields.map(f => {
                const source = field(packet.name ? path.concat(packet.name) : path, f)
                return $(`
                    `, source, `
                `)
            }))
        case 'lengthEncoded':
            return lengthEncoded(path, packet)
        case 'integer':
            return integer(path.concat(packet.name), packet)
        }
    }

    const path = [ packet.name ]
    const source = field([], packet)
    let dispatch = $(`
        switch ($step) {
        `, source, `

            $step = ${step}

        case ${step}:

            break${forever ? ' SERIALIZE' : ''}

        }
    `)
    if (forever) {
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
    var source = join(definition.map(packet => generate(packet)))
    return compiler(source)
}
