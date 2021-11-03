require('proof')(88, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'lookup',
        define: {
            object: {
                nudge: 8,
                value: [ 8, [ 'off', 'on' ] ],
                yn: [ 8, [ 'no', 'yes' ] ],
                binary: [ 8, [ 'off', 'on' ] ],
                mapped: [ 8, { 0: 'off', 1: 'on' } ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, value: 'off', yn: 'no', binary: 'off', mapped: 'off', sentry: 0xaa
        }, {
            nudge: 0xaa, value: 'on', yn: 'yes', binary: 'on', mapped: 'on', sentry: 0xaa
        }]
    })
}
