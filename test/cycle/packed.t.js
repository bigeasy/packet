require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'packed',
        define: {
            object: {
                header: [{
                    literal: 'deaf',
                    one: 1,
                    two: -3,
                    three: 12
                }, 32 ]
            }
        },
        objects: [{ header: { one: 1, two: -4, three: 1 } }]
    })
}
