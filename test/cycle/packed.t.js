require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'packed',
        define: {
            object: {
                header: {
                    literal: 'deaf',
                    one: 1,
                    two: 3,
                    three: 12
                }
            }
        },
        objects: [{ header: { one: 1, two: 5, three: 1 } }],
        stopAt: 'parse.all'
    })
}
