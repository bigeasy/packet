require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'switched/strings',
        define: {
            object: {
                type: 8,
                value: [ $ => $.type, {
                    0: 8,
                    1: 16
                }, 24 ]
            }
        },
        objects: [{
            type: 0,
            value: 0xab
        }, {
            type: 1,
            value: 0xabcd
        }, {
            type: 2,
            value: 0xabcdef
        }]
    })
    cycle(okay, {
        name: 'switched/packed/strings',
        define: {
            object: {
                header: [{
                    type: 2,
                    value: [ $ => $.header.type, {
                        0: 6,
                        1: [ 'a', 2 ]
                    }, [ { two: 2, four: 4 }, 6 ] ]
                }, 8 ]
            }
        },
        objects: [{
            header: {
                type: 0,
                value: 0x2a
            }
        }, {
            header: {
                type: 1,
                value: 0x2
            }
        }, {
            header: {
                type: 3,
                value: {
                    two: 2, four: 0xa
                }
            }
        }]
    })
    cycle(okay, {
        name: 'switched/variant',
        define: {
            object: {
                type: 8,
                value: [ $ => $.type, [[
                    0, 8
                ], [
                    1, 16
                ], [
                    24
                ]]]
            }
        },
        objects: [{
            type: 0,
            value: 0xab
        }, {
            type: 1,
            value: 0xabcd
        }, {
            type: 2,
            value: 0xabcdef
        }]
    })
    cycle(okay, {
        name: 'switched/packed/variant',
        define: {
            object: {
                header: [{
                    type: 2,
                    value: [ $ => $.header.type, [[
                        0, 6
                    ], [
                        1, [ 'a', 2 ]
                    ], [
                        [ { two: 2, four: 4 }, 6 ]
                    ]]]
                }, 8 ]
            }
        },
        objects: [{
            header: {
                type: 0,
                value: 0x2a
            }
        }, {
            header: {
                type: 1,
                value: 0x2
            }
        }, {
            header: {
                type: 2,
                value: {
                    two: 2,
                    four: 0xa
                }
            }
        }]
    })
}
