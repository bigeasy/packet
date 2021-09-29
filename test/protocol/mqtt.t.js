require('proof')(4, okay => {
    const mqtt = require('mqtt-packet')
    const parser = mqtt.parser({ protocolVersion: 5 })


    const SyncSerializer = require('../../sync/serializer')

    const mechanics = require('../../protocol/mqtt')

    const serializer = new SyncSerializer(mechanics)

    function serialize (object) {
        const variable = serializer.serialize('variable', object)
        const fixed = serializer.serialize('fixed', {
            fixed: { ...object.fixed, length: variable.length }
        })
        return Buffer.concat([ fixed, variable ])
    }

    okay(
        mqtt.generate({ cmd: 'pingreq' }).toJSON(),
        serialize({ fixed: { header: { type: 'pingreq' } }, variable: {} }).toJSON(),
        'pingreq'
    )

    okay(
        mqtt.generate({ cmd: 'pingresp' }).toJSON(),
        serialize({ fixed: { header: { type: 'pingresp' } }, variable: {} }).toJSON(),
        'pingresp'
    )

    okay(
        serialize({
            fixed: { header: { type: 'connect' } },
            variable: { flags: { cleanStart: 1 }, clientId: 'a' },
        }).toJSON(),
        mqtt.generate({ cmd: 'connect', clientId: 'a' }).toJSON(),
        'connect no additional payload'
    )

    okay(
        serialize({
            fixed: { header: { type: 'connect' } },
            variable: { flags: { cleanStart: 1 }, clientId: 'a', username: 'a' },
        }).toJSON(),
        mqtt.generate({ cmd: 'connect', clientId: 'a', username: 'a' }).toJSON(),
        'connect with username'
    )

    console.log(serialize({
        fixed: { header: { type: 'connect' } },
        variable: { flags: { cleanStart: 1 }, username: 'a', clientId: 'a' },
    }))
    console.log(mqtt.generate({
        cmd: 'connect',
        clientId: 'a',
        username: 'a'
    }))
    parser.on('packet', packet => console.log(packet))
    parser.parse(mqtt.generate({
        cmd: 'connect'
    }))
})
