require('proof')(36, okay => {
    const mqtt = require('mqtt-packet')
    const parser = mqtt.parser({ protocolVersion: 5 })

    const parsed = []
    parser.on('packet', packet => parsed.push(packet))

    const SyncSerializer = require('../../sync/serializer')
    const SyncParser = require('../../sync/parser')

    const mechanics = require('../../protocol/mqtt')

    const serializer = new SyncSerializer(mechanics)

    function serialize (object) {
        const variable = serializer.serialize('variable', object)
        const fixed = serializer.serialize('fixed', {
            fixed: { ...object.fixed, length: variable.length }
        })
        return Buffer.concat([ fixed, variable ])
    }

    function syncParse (buffer) {
        return new SyncParser(mechanics).parse('mqtt', buffer)
    }

    function test ({ actual, expected }, name) {
        const generated = mqtt.generate(expected.input)
        const serialized = serialize(actual.input)
        okay(serialized.toJSON().data, generated.toJSON().data, `sync serialize ${name}`)
        okay(parser.parse(serialized), 0, `expected parse no remainder for ${name}`)
        okay(JSON.parse(JSON.stringify(parsed.shift())), expected.output, `expected parse for ${name}`)
        const packet = syncParse(serialized)
        okay(packet, actual.output, `sync parse of ${name}`)
    }

    test({
        actual: {
            input: { fixed: { header: { type: 'pingreq' } }, variable: {} },
            output: { fixed: { header: { type: 'pingreq', flags: 0 }, length: 0 }, variable: null }
        },
        expected: {
            input: { cmd: 'pingreq' },
            output: {
                cmd: 'pingreq',
                retain: false,
                qos: 0,
                dup: false,
                length: 0,
                topic: null,
                payload: null
            }
        }
    }, 'pingreq')

    test({
        actual: {
            input: { fixed: { header: { type: 'pingresp' } }, variable: {} },
            output: { fixed: { header: { type: 'pingresp', flags: 0 }, length: 0 }, variable: null }
        },
        expected: {
            input: { cmd: 'pingresp' },
            output: {
                cmd: 'pingresp',
                retain: false,
                qos: 0,
                dup: false,
                length: 0,
                topic: null,
                payload: null
            }
        }
    }, 'pingresp')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connect' } },
                variable: { flags: { cleanStart: 1 }, clientId: 'a' },
            },
            output: {
                fixed: { header: { type: 'connect', flags: 0 }, length: 13 },
                variable: {
                    protocol: 'MQTT',
                    version: 4,
                    flags: {
                        username: 0,
                        password: 0,
                        wilRetain: 0,
                        willQoS: 0,
                        willFlag: 0,
                        cleanStart: 1
                    },
                    keepAlive: 0,
                    clientId: 'a',
                    topic: null,
                    message: null,
                    username: null,
                    password: null
                }
            }
        },
        expected: {
            input: { cmd: 'connect', clientId: 'a' },
            output: {
                cmd: 'connect',
                retain: false,
                qos: 0,
                dup: false,
                length: 13,
                topic: null,
                payload: null,
                protocolId: 'MQTT',
                protocolVersion: 4,
                clean: true,
                keepalive: 0,
                clientId: 'a'
            }
        }
    }, 'connect no additional payload')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connect' } },
                variable: { flags: { cleanStart: 1 }, clientId: 'a', username: 'b' },
            },
            output: {
                fixed: { header: { type: 'connect', flags: 0 }, length: 16 },
                variable: {
                    protocol: 'MQTT',
                    version: 4,
                    flags: {
                        username: 1,
                        password: 0,
                        wilRetain: 0,
                        willQoS: 0,
                        willFlag: 0,
                        cleanStart: 1
                    },
                    keepAlive: 0,
                    clientId: 'a',
                    topic: null,
                    message: null,
                    username: 'b',
                    password: null
                }
            }
        },
        expected: {
            input: { cmd: 'connect', clientId: 'a', username: 'b' },
            output: {
                cmd: 'connect',
                retain: false,
                qos: 0,
                dup: false,
                length: 16,
                topic: null,
                payload: null,
                protocolId: 'MQTT',
                protocolVersion: 4,
                clean: true,
                keepalive: 0,
                clientId: 'a',
                username: 'b'
            }
        }
    }, 'connect with username')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connect' } },
                variable: {
                    flags: { cleanStart: 1 },
                    clientId: 'a',
                    username: 'b',
                    password: Buffer.from('c')
                },
            },
            output: {
                fixed: { header: { type: 'connect', flags: 0 }, length: 19 },
                variable: {
                    protocol: 'MQTT',
                    version: 4,
                    flags: {
                        username: 1,
                        password: 1,
                        wilRetain: 0,
                        willQoS: 0,
                        willFlag: 0,
                        cleanStart: 1
                    },
                    keepAlive: 0,
                    clientId: 'a',
                    topic: null,
                    message: null,
                    username: 'b',
                    password: Buffer.from('c')
                }
            }
        },
        expected: {
            input: { cmd: 'connect', clientId: 'a', username: 'b', password: Buffer.from('c') },
            output: {
                cmd: 'connect',
                retain: false,
                qos: 0,
                dup: false,
                length: 19,
                topic: null,
                payload: null,
                protocolId: 'MQTT',
                protocolVersion: 4,
                clean: true,
                keepalive: 0,
                clientId: 'a',
                username: 'b',
                password: Buffer.from('c').toJSON()
            }
        }
    }, 'connect with username and password')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connect' } },
                variable: {
                    flags: { cleanStart: 1 },
                    clientId: 'a',
                    username: 'b',
                    password: Buffer.from('c'),
                    topic: 'd',
                    message: Buffer.from('e')
                },
            },
            output: {
                fixed: { header: { type: 'connect', flags: 0 }, length: 25 },
                variable: {
                    protocol: 'MQTT',
                    version: 4,
                    flags: {
                        username: 1,
                        password: 1,
                        wilRetain: 0,
                        willQoS: 0,
                        willFlag: 1,
                        cleanStart: 1
                    },
                    keepAlive: 0,
                    clientId: 'a',
                    topic: null,
                    message: null,
                    topic: 'd',
                    message: Buffer.from('e'),
                    username: 'b',
                    password: Buffer.from('c')
                }
            }
        },
        expected: {
            input: {
                cmd: 'connect',
                clientId: 'a',
                username: 'b',
                password: Buffer.from('c'),
                will: {
                    topic: 'd',
                    payload: Buffer.from('e')
                }
            },
            output: {
                cmd: 'connect',
                retain: false,
                qos: 0,
                dup: false,
                length: 25,
                will: {
                    retain: false,
                    qos: 0,
                    topic: 'd',
                    payload: Buffer.from('e').toJSON(),
                },
                protocolId: 'MQTT',
                protocolVersion: 4,
                clean: true,
                keepalive: 0,
                clientId: 'a',
                username: 'b',
                topic: null,
                payload: null,
                password: Buffer.from('c').toJSON()
            }
        }
    }, 'connect with topic, username and password')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connack' } },
                variable: {
                    flags: { sessionPresent: 1 },
                    reasonCode: 128
                },
            },
            output: {
                fixed: { header: { type: 'connack', flags: 0 }, length: 2 },
                variable: {
                    flags: { sessionPresent: 1 },
                    reasonCode: 128
                }
            }
        },
        expected: {
            input: {
                cmd: 'connack',
                sessionPresent: true,
                returnCode: 128
            },
            output: {
                cmd: 'connack',
                retain: false,
                qos: 0,
                dup: false,
                length: 2,
                topic: null,
                payload: null,
                sessionPresent: true,
                returnCode: 128
            }
        }
    }, 'connack session present')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'connack' } },
                variable: {
                    flags: { sessionPresent: 0 },
                    reasonCode: 0
                },
            },
            output: {
                fixed: { header: { type: 'connack', flags: 0 }, length: 2 },
                variable: {
                    flags: { sessionPresent: 0 },
                    reasonCode: 0
                }
            }
        },
        expected: {
            input: {
                cmd: 'connack',
                sessionPresent: false,
                returnCode: 0
            },
            output: {
                cmd: 'connack',
                retain: false,
                qos: 0,
                dup: false,
                length: 2,
                topic: null,
                payload: null,
                sessionPresent: false,
                returnCode: 0
            }
        }
    }, 'connack session present')

    test({
        actual: {
            input: {
                fixed: { header: { type: 'publish', flags: { qos: 2, dup: 0, retain: 0 } } },
                variable: {
                    topic: 'test',
                    id: 42,
                    payload: Buffer.alloc(0)
                },
            },
            output: {
                fixed: { header: { type: 'publish', flags: { qos: 2, dup: 0, retain: 0 } }, length: 8 },
                variable: {
                    topic: 'test',
                    id: 42,
                },
            }
        },
        expected: {
            input: {
                cmd: 'publish',
                qos: 2,
                messageId: 42,
                dup: false,
                topic: 'test',
                retain: false,
                payload: Buffer.alloc(0)
            },
            output: {
                cmd: 'publish',
                qos: 2,
                messageId: 42,
                length: 8,
                dup: false,
                topic: 'test',
                retain: false,
                payload: { type: 'Buffer', data: [] }
            }
        }
    }, 'no payload publish')
    console.log(serialize({
        fixed: { header: { type: 'connect' } },
        variable: { flags: { cleanStart: 1 }, username: 'a', clientId: 'a' },
    }))
    console.log(mqtt.generate({
        cmd: 'connect',
        clientId: 'a',
        username: 'a'
    }))
    parser.parse(mqtt.generate({
        cmd: 'connect'
    }))
})
