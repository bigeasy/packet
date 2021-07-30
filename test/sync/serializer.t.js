require('proof')(1, okay => {
    const Serializer = require('../../sync/serializer')
    const definition = require('../generated')

    const serializer = new Serializer(require('../generated'))

    const buffer = serializer.write('first', { value: 0xaaaa })
    okay(buffer.toJSON().data, [ 0xaa, 0xaa ], 'serialize')
})
