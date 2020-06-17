require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'literal',
        define: {
            object: {
                padded: [ '0faded', 16, 'facade' ]
            }
        },
        objects: [{ padded: 0xabcd }]
    })
}
