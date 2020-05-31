require('proof')(0, prove)

function prove (okay) {
    const cycle = require('./cycle')
    cycle(okay, {
        name: 'mysql',
        define: {
            object: {
                value: [[[
                    value => value < 251, 8
                ], [
                    value => value >= 251, [ 'fc', 16 ]
                ]], [ 8, [
                    sip => sip < 251, sip => sip
                ], [
                    sip => sip == 0xfc, 16
                ]]]
            }
        },
        objects: [{ value: 250 }, { value: 251 }]
    })
    cycle(okay, {
        name: 'sipless',
        define: {
            object: {
                type: 8,
                value: [
                    [[
                        (_, $) => $.type == 0, 16
                    ], [
                        (_, $) => $.type == 1, 32
                    ]],
                    [[
                        $ => $.type == 0, 16
                    ], [
                        $ => $.type == 1, 32
                    ]]
                ]
            }
        },
        objects: [{ type: 0, value: 0xaaaa }, { type: 1, value: 0xaaaaaaaa }],
        stopAt: 'parse.bff'
    })
}
