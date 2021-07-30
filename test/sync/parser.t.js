require('proof')(1, okay => {
    const Parser = require('../../sync/parser')
    const definition = require('../generated')

    const parser = new Parser(require('../generated'))

    const object = parser.parse('first', Buffer.from([ 0xaa, 0xaa ]))
    okay(object, { value: 0xaaaa }, 'parsed')
})
