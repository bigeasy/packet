require('proof')(0, prove)

function prove (okay) {
    require('./cycle')(okay, {
        name: 'mysql',
        define: {
            object: {
                value: [[[
                    value => value < 251, 8
                ], [
                    value => value >= 251, [ 'fc', 16 ]
                ]], [ 8, [[
                    sip => sip < 251, sip => sip
                ], [
                    sip => sip == 0xfc, 16
                ]]]]
            }
        },
        objects: [{ value: 250 }, { value: 251 }],
        stopAt: 'parse.inc'
    })
}
