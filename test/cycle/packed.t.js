require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'packed',
        define: {
            object: {
                nudge: 8,
                header: [{
                    one: [[ 15, '5eaf' ], 2 ],
                    two: -3,
                    three: 10,
                    four: [ 2, [
                        'zero', 'one', 'two', 'three'
                    ]]
                }, 32 ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            header: { one: 3, two: -4, three: 1, four: 'three' },
            sentry: 0xaa
        }]
    })
}
