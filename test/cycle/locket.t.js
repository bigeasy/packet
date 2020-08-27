require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'locket/key',
        define: {
            object: {
                version: 64n
            }
        },
        objects: [{
            version: 1n
        }],
        stopAt: 'parse.all'
    })
    cycle(okay, {
        name: 'locket/meta',
        define: {
            object: {
                header: [{
                    method: [ 1, [ 'del', 'put' ] ],
                    index: 31
                }, 32 ],
                count: 32,
                version: 64n
            }
        },
        objects: [{
            header: {
                method: 'put',
                index: 3
            },
            count: 8,
            version: 1n
        }],
        stopAt: 'parse.all'
    })
}
