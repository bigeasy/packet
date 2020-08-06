require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'switch/named',
        define: {
            object: {
                type: 8,
                value: [ ({ $ }) => $.type, [
                    { $_: 0 }, 8,
                    { $_: 1 }, 16,
                    { $_: [] }, 24
                ]],
                sentry: 8
            }
        },
        objects: [{
            type: 0,
            value: 0xab,
            sentry: 0xaa
        }, {
            type: 1,
            value: 0xabcd,
            sentry: 0xaa
        }, {
            type: 2,
            value: 0xabcdef,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'switch/packed/named',
        define: {
            object: {
                header: [{
                    type: 2,
                    value: [ ({ $ }) => $.header.type, [
                        { $_: 0 }, 6,
                        { $_: 1 }, [ 'a', 2 ],
                        { $_: [] }, [ { two: 2, four: 4 }, 6 ]
                    ]]
                }, 8 ],
                sentry: 8
            }
        },
        objects: [{
            header: {
                type: 0,
                value: 0x2a
            },
            sentry: 0xaa
        }, {
            header: {
                type: 1,
                value: 0x2
            },
            sentry: 0xaa
        }, {
            header: {
                type: 3,
                value: {
                    two: 2, four: 0xa
                }
            },
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'switch/variant',
        define: {
            object: {
                type: 8,
                value: [ $ => $.type, [
                    { $_: 0 }, 8,
                    { $_: [ 1 ] }, 16,
                    { $_: [] }, 24
                ]],
                sentry: 8
            }
        },
        objects: [{
            type: 0,
            value: 0xab,
            sentry: 0xaa
        }, {
            type: 1,
            value: 0xabcd,
            sentry: 0xaa
        }, {
            type: 2,
            value: 0xabcdef,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'switch/packed/variant',
        define: {
            object: {
                header: [{
                    type: 2,
                    value: [ $ => $.header.type, [
                        { $_: 0 }, 6,
                        { $_: [ 1 ] }, [ 'a', 2 ],
                        { $_: [] }, [ { two: 2, four: 4 }, 6 ]
                    ]]
                }, 8 ],
                sentry: 8
            }
        },
        objects: [{
            header: {
                type: 0,
                value: 0x2a
            },
            sentry: 0xaa
        }, {
            header: {
                type: 1,
                value: 0x2
            },
            sentry: 0xaa
        }, {
            header: {
                type: 2,
                value: {
                    two: 2,
                    four: 0xa
                }
            },
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'switch/vivify',
        define: {
            object: {
                type: 8,
                value: [ $ => $.type, [
                    { $_: 0 }, { value: 8 },
                    { $_: 1 }, [ 8, [ 8 ] ],
                    { $_: 2 }, [ [ 8 ], 0x0 ],
                    { $_: 3 }, [ 8, [ Buffer ] ],
                    { $_: 4 }, [ [ 3 ], [ 8 ] ],
                    { $_: [] }, [ [ 3 ], [ Buffer ] ]
                ]],
                sentry: 8
            }
        },
        objects: [{
            type: 0, value: { value: 1 }, sentry: 0xaa
        }, {
            type: 1, value: Buffer.from('abc').toJSON().data, sentry: 0xaa
        }, {
            type: 2, value: Buffer.from('abc').toJSON().data, sentry: 0xaa
        }, {
            type: 3, value: Buffer.from('abc'), sentry: 0xaa
        }, {
            type: 4, value: Buffer.from('abc').toJSON().data, sentry: 0xaa
        }, {
            type: 5, value: Buffer.from('abc'), sentry: 0xaa
        }]
    })
}
