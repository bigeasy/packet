require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'literal',
        define: {
            object: {
                padded: [ '0faded', 16, 'facade' ],
                sentry: 8
            }
        },
        objects: [{ padded: 0xabcd, sentry: 0xaa }]
    })
}
