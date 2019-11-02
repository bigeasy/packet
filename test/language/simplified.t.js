require('proof')(1, async (okay) => {
    const simplified = require('../../simplified')
    const path = require('path')
    const fs = require('fs').promises
    async function test (name, definition) {
        const actual = simplified(definition)
        const expected = JSON.parse(await fs.readFile(path.resolve(__dirname, 'compiled', `${name}.json`)))
        okay(actual, expected, name)
    }
    await test('minimal', { packet: { value: 16 } })

    const encode = [
        8, value => (value % 128) & (value > 128 ? 0x80 : 0x0), value => Math.floor(value / 128), value => value == 0
    ]

    const intermediate = simplified({
        /*
        integer: {
            parse: [ 8n, [
                value => value < 251, value => value
                value => value == 0xfc, 16n
                value => value == 0xfd, 24n
                value, ($, _) => value == 0xfe && $.length - _.i < 8, [ 'eof' ]
                value, $ => value == 0xfe, 64n
            ]],
            serialize: [ value => {
                if (value < 251) return 0
                else if (value >= 251 && < Math.pow(2, 16)) return 1
                else if (value >= Math.pow(2, 16) && < Math.pow(2, 24)) return 2
                else if (value >= Math.pow(2, 16) && < Math.pow(2, 24)) return 2
            }, [
                value => value
            ]]
        }
        */
        integer: {
            $parse: [[
                8, value => value & 0x7f, value => value & 0x80
            ], [
                8, value => (value & 0x7f) * 128, value => value & 0x80
            ], [
                8, value => (value & 0x7f) * 128 ** 2, value => value & 0x80
            ], [
                8, value => (value & 0x7f) * 128 ** 3, value => value & 0x80
            ]],
            $serialize: [ encode, encode, encode, encode ]
        },
        packet: {
            header: {
                type: [ 4, [
                    'connect',
                    'connack',
                    'publish',
                    'puback',
                    'pubrec',
                    'pubrel',
                    'pubcomp',
                    'subscribe',
                    'suback',
                    'unsubscribe',
                    'unsuback',
                    'pingreq',
                    'pingresp',
                    'disconnect',
                    'auth'
                ] ],
                flags: [ $ => $.header.type, {
                    connect: [ 4, 0x0 ],
                    connack: [ 4, 0x0 ],
                    publish: { dup: 1, qos: 2, retain: 1 },
                    puback: [ 4, 0x0 ],
                    pubrec: [ 4, 0x0 ],
                    pubrel: [ 4, 0x2 ],
                    pubcomp: [ 4, 0x0 ],
                    subscribe: [ 4, 0x2 ],
                    suback: [ 4, 0x0 ],
                    unsubscribe: [ 4, 0x2 ],
                    unsuback: [ 4, 0x0 ],
                    pingreq: [ 4, 0x0 ],
                    pingresp: [ 4, 0x0 ],
                    disconnect: [ 4, 0x0 ],
                    auth: [ 4, 0x0 ]
                } ]
            },
            remainingLength: [ 'integer' ]
        }
    })

    console.log(require('util').inspect(intermediate, { depth: null }))

    const compiler = require('../../require')
    const composer = require('../../serialize.all')
    const filename = path.resolve(__filename, '../../generated/mqtt.serialize.all.js')

    const serializers = { all: {} }

    intermediate[1].fields[0].bits = 8

    console.log(intermediate)

//    composer(compiler('serializers', filename), [{ type: 'structure', name: 'object', ...intermediate.packet }])
})
