require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'packed',
        define: {
            object: {
                header: [{
                    one: [[ 15, '5eaf' ], 2 ],
                    two: -3,
                    three: 12
                }, 32 ],
                sentry: 8
            }
        },
        objects: [{ header: { one: 3, two: -4, three: 1 }, sentry: 0xaa }],
        stopAt: 'parse.all'
    })
}
