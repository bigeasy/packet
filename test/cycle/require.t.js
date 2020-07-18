require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'require/module',
        define: {
            object: {
                value: [[[ value => twiddle(value) ]], 32 ],
                sentry: 8
            }
        },
        require: {
            twiddle: '../../cycle/twiddle'
        },
        objects: [{ value: 1, sentry: 0xaa }]
    })
}
