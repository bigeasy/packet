require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'locket/key',
        define: {
            object: {
                header: [{
                    method: [ 1, [ 'del', 'put' ] ],
                    count: 31
                }, 32 ],
                version: 64n,
                key: [ 32, [ Buffer ] ]
            }
        },
        objects: [{
            header: {
                method: 'put',
                count: 8
            },
            version: 1n,
            key: Buffer.from('abcd')
        }],
        stopAt: 'parse.all'
    })
}
