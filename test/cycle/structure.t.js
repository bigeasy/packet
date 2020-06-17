require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'array/words',
        define: {
            object: {
                value: {
                    first: 8,
                    second: 8
                }
            }
        },
        objects: [{ value: { first: 1, second: 2 } }]
    })
}
