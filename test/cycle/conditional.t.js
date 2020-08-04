require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'conditional/mqtt',
        define: {
            object: {
                nudge: 8,
                value: [
                    [
                        value => value <= 0x7f, 8,
                        value => value <= 0x3fff, [ 16, 0x80, 7, 0x0, 7 ],
                        value => value <= 0x1fffff, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                        true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
                    ],
                    [ 8,
                        sip => (sip & 0x80) == 0, 8,
                        true, [ 8,
                            sip => (sip & 0x80) == 0, [ 16, 0x80, 7, 0x0, 7 ],
                            true, [ 8,
                                sip => (sip & 0x80) == 0, [ 24, 0x80, 7, 0x80, 7, 0x0, 7 ],
                                true, [ 32, 0x80, 7, 0x80, 7, 0x80, 7, 0x0, 7 ]
                            ]
                        ]
                    ]
                ],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa, value: 0x81, sentry: 0xaa
        }]
    })
    return
    cycle(okay, {
        name: 'conditional/mysql',
        define: {
            object: {
                value: [[
                    value => value < 251, 8,
                    value => value >= 251 && value < 2 ** 16, [ 'fc', 16 ],
                    true, [ 'fd', 24 ]
                ], [ 8,
                    sip => sip < 251, 8,
                    sip => sip == 0xfc, [ 'fc', 16 ],
                    true, [ 'fd', 24 ]
                ]],
                sentry: 8
            }
        },
        objects: [{
            value: 250, sentry: 0xaa
        }, {
            value: 251, sentry: 0xaa
        }, {
            value: 2 ** 16, sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'conditional/sipless',
        define: {
            object: {
                type: 8,
                value: [
                    [
                        (_, $) => $.type == 0, 16,
                        (_, $) => $.type == 1, 24,
                        true, 32
                    ],
                    [
                        $ => $.type == 0, 16,
                        $ => $.type == 1, 24,
                        true, 32
                    ]
                ],
                sentry: 8
            }
        },
        objects: [{
            type: 0, value: 0xaaaa, sentry: 0xaa
        }, {
            type: 1, value: 0xaaaaaa, sentry: 0xaa
        }, {
            type: 2, value: 0xaaaaaaaa, sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'conditional/bidirectional',
        define: {
            object: {
                type: 8,
                value: [
                    $ => $.type == 0, 16,
                    $ => $.type == 1, 24,
                    true, 32
                ],
                sentry: 8
            }
        },
        objects: [{
            type: 0, value: 0xaaaa, sentry: 0xaa
        }, {
            type: 1, value: 0xaaaaaa, sentry: 0xaa
        }, {
            type: 2, value: 0xaaaaaaaa, sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'conditional/packed/positional',
        define: {
            object: {
                header: [{
                    flag: 2,
                    value: [
                        $ => $.header.flag == 0, 6,
                        $ => $.header.flag == 1, [ 'a', 2 ],
                        $ => $.header.flag == 2, [{
                            two: 2,
                            four: 4
                        }, 6 ],
                        true, [{
                            one: 1,
                            five: 5
                        }, 6 ]
                    ]
                }, 8 ],
                sentry: 8
            }
        },
        objects: [{
            header: {
                flag: 0, value: 0x2a
            },
            sentry: 0xaa
        }, {
            header: {
                flag: 1, value: 3
            },
            sentry: 8
        }, {
            header: {
                flag: 2,
                value: {
                    two: 2,
                    four: 10
                }
            },
            sentry: 0xaa
        }, {
            header: {
                flag: 3,
                value: {
                    one: 1,
                    five: 0x13
                }
            },
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'conditional/packed/named',
        define: {
            object: {
                header: [{
                    flag: 2,
                    value: [
                        ({ $ }) => $.header.flag == 0, 6,
                        ({ $ }) => $.header.flag == 1, [ 'a', 2 ],
                        ({ $ }) => $.header.flag == 2, [{
                            two: 2,
                            four: 4
                        }, 6 ],
                        true, [{
                            one: 1,
                            five: 5
                        }, 6 ]
                    ]
                }, 8 ],
                sentry: 8
            }
        },
        objects: [{
            header: {
                flag: 0, value: 0x2a
            },
            sentry: 0xaa
        }, {
            header: {
                flag: 1, value: 3
            },
            sentry: 8
        }, {
            header: {
                flag: 2,
                value: {
                    two: 2,
                    four: 10
                }
            },
            sentry: 0xaa
        }, {
            header: {
                flag: 3,
                value: {
                    one: 1,
                    five: 0x13
                }
            },
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'conditional/vivify',
        define: {
            object: {
                type: 8,
                value: [
                    $ => $.type == 0, { value: 8 },
                    $ => $.type == 1, [ 8, [ 8 ] ],
                    $ => $.type == 2, [ [ 8 ], 0x0 ],
                    $ => $.type == 3, [ 8, [ Buffer ] ],
                    $ => $.type == 4, [ [ 3 ], [ 8 ] ],
                    true, [ [ 3 ], [ Buffer ] ]
                ],
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
