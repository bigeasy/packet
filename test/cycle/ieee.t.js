require('proof')(0, prove)


function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'ieee/specified/le/double',
        define: {
            object: {
                value: [ 0.64, ~64 ],
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/specified/be/double',
        define: {
            object: {
                value: [ 0.64, 64 ],
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/specified/le/float',
        define: {
            object: {
                value: [ 0.32, ~32 ],
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/specified/be/float',
        define: {
            object: {
                value: [ 0.32, 32 ],
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/be/double',
        define: {
            object: {
                value: 64.64,
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/be/float',
        define: {
            object: {
                value: 32.32,
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/le/double',
        define: {
            object: {
                value: 64.46,
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'ieee/le/float',
        define: {
            object: {
                value: 32.23,
                sentry: 8
            }
        },
        objects: [{ value: -1, sentry: 0xaa }]
    })
}
