require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'array/objects',
        define: {
            object: {
                array: [ 8, [{
                    mask: 16,
                    value: [[
                        ($_, $, $i) => $_ ^ $.array[$i[0]].mask
                    ], 16, [
                        ($_, $, $i) => $_ ^ $.array[$i[0]].mask
                    ]]
                }]]
            }
        },
        objects: [{
            array: [{
                mask: 0xaaaa, value: 0xabcd
            }, {
                mask: 0xffff, value: 0x1234
            }]
        }]
    })
    cycle(okay, {
        name: 'array/words',
        define: {
            object: { nudge: 8, array: [ 16, [ 16 ] ], sentry: 8  }
        },
        objects: [{ nudge: 0xaa, array: [ 0x1236, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/object',
        define: {
            object: { array: [ 16, [{ value: 16 }] ] }
        },
        objects: [{ array: [{ value: 0xaaaa }] }]
    })
    cycle(okay, {
        name: 'array/fixed',
        define: {
            object: { nudge: 8, array: [ 16, [{ first: 16, second: 16 }] ], sentry: 8 }
        },
        objects: [{
            nudge: 0xaa,
            array: [{
                first: 0x1234, second: 0x4567
            }, {
                first: 0x89a0, second: 0xcdef
            }],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/nested',
        define: {
            object: { nudge: 8, array: [ 16, [[ 16, [ 16 ] ]] ], sentry: 8 }
        },
        objects: [{ nudge: 0xaa, array: [[ 0x1234, 0x4567 ], [ 1, 2 ]], sentry: 0xaa }]
    })
    cycle(okay, {
        name: 'array/variable',
        define: {
            object: { nudge: 8, array: [ 16, [{ first: [ 16, [ 16 ] ] }] ], sentry: 8 }
        },
        objects: [{
            nudge: 0xaa,
            array: [{
                first:  [ 0x1234, 0x4567 ]
            }, {
                first: [ 1, 2 ]
            }],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/concat',
        define: {
            object: {
                nudge: 8,
                array: [ 8, [ Buffer ] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: Buffer.from('abcdefgh'),
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/chunked',
        define: {
            object: {
                nudge: 8,
                array: [ 8, [[ Buffer ]] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: [ Buffer.from('abcdefgh') ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/wrapped',
        define: {
            $value: 8,
            object: {
                nudge: 8,
                // **TODO**: Inline should pass in buffer length.
                // **TODO**: Add this to the language tests.
                array: [ [[ 'cd', 1 ], [[ value => value ], '$value', [ value => value ]] ], [ 8 ] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: [ 0xa, 0xb, 0xc, 0xd ],
            sentry: 0xaa
        }]
    })
    const array = []
    for (let i = 0; i < 128; i++) {
        array.push(i)
    }
    cycle(okay, {
        name: 'array/spread',
        define: {
            $value: 8,
            object: {
                nudge: 8,
                array: [ [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],  [ 8 ] ],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: array,
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/conditional/split',
        define: {
            object: {
                nudge: 8,
                array: [[
                    [
                        value => value < 128, 8,
                        /*value => value < 0x3fff, 8,*/
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ], [ 8,
                        sip => (sip & 0x80) == 0, 8,
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                        /*
                        [ 8,
                            sip => (sip & 0x80) == 0, 8,
                            */
                            /*
                        ]
                        */
                    ]
                ], [ 8 ]],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: array,
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            array: [ 0x0, 0x1 ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/conditional/sip',
        define: {
            object: {
                nudge: 8,
                array: [[
                    [
                        value => value < 128, 8,
                        value => value < 0x3fff, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                        true, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ], [ 8,
                        sip => (sip & 0x80) == 0, 8,
                        true, [ 8,
                            sip => (sip & 0x80) == 0, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ],
                            true, [ 24, [ 0x80, 7 ], [ 0x80, 7 ], [ 0x0, 7 ] ],
                        ]
                    ]
                ], [ 8 ]],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: array,
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            array: [ 0x0, 0x1 ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/conditional/concat',
        define: {
            $value: 8,
            object: {
                nudge: 8,
                array: [[
                    [
                        value => value < 128, 8,
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ], [ 8,
                        sip => (sip & 0x80) == 0, 8,
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ]
                ], [ Buffer ]],
                // Need to force the best-foot-forward check.
                sentry: 8
            }
        },
        // Repeat test simply to get the coverage of the generated conditional.
        objects: [{
            nudge: 0xaa,
            array: Buffer.from(array),
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            array: Buffer.from([ 0x0, 0x1 ]),
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/conditional/chunked',
        define: {
            object: {
                nudge: 8,
                array: [[
                    [
                        value => value < 128, 8,
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ], [ 8,
                        sip => (sip & 0x80) == 0, 8,
                        true, [ 16, [ 0x80, 7 ], [ 0x0, 7 ] ]
                    ]
                ], [[ Buffer ]]],
                sentry: 8
            }
        },
        objects: [{
            nudge: 0xaa,
            array: [ Buffer.from(array) ],
            sentry: 0xaa
        }, {
            nudge: 0xaa,
            array: [ Buffer.from([ 0x0, 0x1 ]) ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/switch/bytes',
        define: {
            object: {
                type: 8,
                array: [[ $ => $.type, [
                    { $_: 0 }, 8,
                    { $_: [] }, 16
                ]], [ 8 ]],
                sentry: 8
            }
        },
        objects: [{
            type: 0,
            array: [ 0x0, 0x1 ],
            sentry: 0xaa
        }, {
            type: 1,
            array: [ 0x0, 0x1 ],
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/switch/concat',
        define: {
            object: {
                type: 8,
                array: [[ $ => $.type, [
                    { $_: 0 }, 8,
                    { $_: [] }, 16
                ]], [ Buffer ]],
                sentry: 8
            }
        },
        objects: [{
            type: 0,
            array: Buffer.from([ 0x0, 0x1 ]),
            sentry: 0xaa
        }, {
            type: 1,
            array: Buffer.from([ 0x0, 0x1 ]),
            sentry: 0xaa
        }]
    })
    cycle(okay, {
        name: 'array/switch/chunked',
        define: {
            object: {
                type: 8,
                array: [[ $ => $.type, [
                    { $_: 0 }, 8,
                    { $_: [] }, 16
                ]], [[ Buffer ]]],
                sentry: 8
            }
        },
        objects: [{
            type: 0,
            array: [ Buffer.from([ 0x0, 0x1 ]) ],
            sentry: 0xaa
        }, {
            type: 1,
            array: [ Buffer.from([ 0x0, 0x1 ]) ],
            sentry: 0xaa
        }]
    })
    // # Issue: https://github.com/bigeasy/packet/issues/610
    cycle(okay, {
        name: 'array/include',
        define: {
            $include: 16,
            object: { nudge: 8, array: [ '$include', [ 16 ] ], sentry: 8  }
        },
        objects: [{ nudge: 0xaa, array: [ 0x1236, 0x4567, 0x890a, 0xcdef ], sentry: 0xaa }]
    })
    // # Issue: https://github.com/bigeasy/packet/issues/611
    cycle(okay, {
        name: 'array/multiple',
        define: {
            object: { nudge: 8, first: [ 16, [ Buffer ] ], second: [ 16, [ Buffer ] ], sentry: 8  }
        },
        objects: [{ nudge: 0xaa, first: Buffer.from([ 0x1 ]), second: Buffer.from([ 0x2 ]), sentry: 0xaa }]
    })
    /*
    cycle(okay, {
        name: 'array/multiple',
        define: {
            $select: [ $ => 0, [ { $_: 0 }, 8 ] ],
            object: { nudge: 8, first: [ '$select', [ 8 ] ], second: [ '$select', [ 8 ] ], sentry: 8  }
        },
        objects: [{ nudge: 0xaa, first: [ 0x1 ], second: [ 0x2 ], sentry: 0xaa }]
    })
    */
}
