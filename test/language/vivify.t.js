require('proof')(14, okay => {
    const language = require('../../language')
    const $ = require('programmatic')
    const vivify = require('../../vivify')
    // Basic types.
    okay(vivify.structure('let packet', language({
        packet: {
            value: 8
        }
    }).shift()).split('\n'), $(`
        let packet = {
            value: 0
        }
    `).split('\n'), 'number')
    okay(vivify.structure('let packet', language({
        packet: {
            value: 64n
        }
    }).shift()).split('\n'), $(`
        let packet = {
            value: 0n
        }
    `).split('\n'), 'bigint')
    okay(vivify.structure('let packet', language({
        packet: {
            value: [ 32, [ 8 ] ]
        }
    }).shift()).split('\n'), $(`
        let packet = {
            value: []
        }
    `).split('\n'), 'array')
    okay(vivify.structure('let packet', language({
        packet: {
            value: [ $ => $.type, [
                { $_: 'integer' }, 8,
                { $_: 'array' }, [ 32, [ 8 ] ]
            ]]
        }
    }).shift()).split('\n'), $(`
        let packet = {
            value: null
        }
    `).split('\n'), 'variant')
    okay(vivify.structure('let packet', language({
        packet: {
            packed: [{
                first: 4,
                second: 4
            }, 8 ]
        }
    }).shift()).split('\n'), $(`
        let packet = {
            packed: {
                first: 0,
                second: 0
            }
        }
    `).split('\n'), 'packed')
    okay(vivify.structure('let packet', language({
        packet: {
            _packed: [{
                first: 4,
                second: 4
            }, 8 ]
        }
    }).shift()).split('\n'), $(`
        let packet = {
            first: 0,
            second: 0
        }
    `).split('\n'), 'packed elided')
    okay(vivify.structure('let packet', language({
        packet: {
            object: {
                value: 8
            }
        }
    }).shift()), $(`
        let packet = {
            object: {
                value: 0
            }
        }
    `), 'structure')
    okay(vivify.structure('let packet', language({
        packet: {
            _elided: {
                value: 8
            }
        }
    }).shift()), $(`
        let packet = {
            value: 0
        }
    `), 'elided structure')
    okay(vivify.structure('let packet', language({
        packet: {
            first: 8,
            _elided: {
                value: 8
            },
            second: 8
        }
    }).shift()).split('\n'), $(`
        let packet = {
            first: 0,
            value: 0,
            second: 0
        }
    `).split('\n'), 'elided structure with siblings')
    okay(vivify.structure('let packet', language({
        packet: {
            first: 8,
            _elided: {
                third: 8,
                _elided: {
                    fifth: 8,
                    sixth: 8
                },
                fourth: 8,
            },
            second: 8
        }
    }).shift()).split('\n'), $(`
        let packet = {
            first: 0,
            third: 0,
            fifth: 0,
            sixth: 0,
            fourth: 0,
            second: 0
        }
    `).split('\n'), 'doubly elided structure with siblings')
    debugger
    okay(vivify.structure('let packet', language({
        packet: {
            object: [[[ $_ => $_ ]], {
                value: 8
            }]
        }
    }).shift()), $(`
        let packet = {
            object: {
                value: 0
            }
        }
    `), 'inline')
    okay(vivify.structure('let packet', language({
        packet: {
            _elided: [[[ $_ => $_ ]], {
                value: 8
            }]
        }
    }).shift()), $(`
        let packet = {
            value: 0
        }
    `), 'elided inline')
    okay(vivify.structure('let packet', language({
        packet: {
            _elided: [[[ $_ => $_ ]], {
                value: [[[ $_ => $_ ]], 8 ]
            }]
        }
    }).shift()), $(`
        let packet = {
            value: 0
        }
    `), 'elided double inline')
    debugger
    okay(vivify.structure('let packet', language({
        packet: [{ hash: () => crypto.createHash('md5') }, {
            body: [[[
                ({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end))
            ]], {
                number: 32,
                data: [[ 8 ], 0x0 ]
            }],
            checksum: [[
                ({ $_, hash }) => $_ = hash.digest()
            ], [[ 16 ], [ Buffer ]], [
                ({ checksum = 0, hash }) => {
                    assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                }
            ]]
        }]
    }).shift()).split('\n'), $(`
        let packet = {
            body: {
                number: 0,
                data: []
            },
            checksum: null
        }
    `).split('\n'), 'elided double inline')
})
