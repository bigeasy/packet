require('proof')(2, okay => {
    const mqtt = require('mqtt-packet')


    const SyncSerializer = require('../../sync/serializer')

    const mechanics = require('../../protocol/mqtt')

    const serializer = new SyncSerializer(mechanics)

    okay(
        mqtt.generate({ cmd: 'pingreq' }).toJSON(),
        serializer.serialize('mqtt', { header: { type: 'pingreq' }, body: Buffer.alloc(0) }).toJSON(),
        'pingreq'
    )

    okay(
        mqtt.generate({ cmd: 'pingresp' }).toJSON(),
        serializer.serialize('mqtt', { header: { type: 'pingresp' }, body: Buffer.alloc(0) }).toJSON(),
        'pingresp'
    )
})
