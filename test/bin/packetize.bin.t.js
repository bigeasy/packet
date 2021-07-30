require('proof')(2, async okay => {
    const packetize = require('../../packetize.bin')
    const stream = require('stream')

    const path = require('path')

    const example = path.resolve(__dirname, '..', '..', 'example.js')

    const child = packetize([ example ], { $stdout: new stream.PassThrough })

    okay(0, await child.exit, 'ran')

    const f = new Function('module', child.options.$stdout.read().toString())

    const m = {}

    f(m)

    okay(Object.keys(m.exports).sort(), [ 'parser', 'serializer', 'sizeOf' ], 'built')
})
