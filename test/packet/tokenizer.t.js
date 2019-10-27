require('proof')(3, prove)

function prove (assert) {
    var tokenize = require('../../tokenizer')

    assert(tokenize({}, 'b8'), {
        type: 'integer',
        endianness: 'b',
        bits: 8
    }, 'byte')

    assert(tokenize({}, 'b16'), {
        type: 'integer',
        endianness: 'b',
        bits: 16
    }, 'word')

    assert(tokenize({}, 'b16[10]'), {
        type: 'integer',
        endianness: 'b',
        repeat: 10,
        bits: 16 }, 'word')
}
