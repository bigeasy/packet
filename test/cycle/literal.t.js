require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay)({
        name: 'word',
        define: {
            object: {
                padded: [ '0faded', 16, 'deface' ]
            }
        },
        object: { padded: 0xabcd, word: 0xabcd },
        stopAt: 'sizeof'
    })
}
