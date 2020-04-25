require('proof')(8, function (equal) {
    const pack = require('../../fiddle/pack')

    let f

    f = new Function('value', 'return ' + pack(16, 5, 7, 'value'))
    equal(f(0x7f).toString(2), '11111110000', 'short')
    f = new Function('value', 'return ' + pack(32, 0, 2, 'value'))
    equal(f(0x3).toString(2), '11000000000000000000000000000000', 'word left most')
    equal(f(-1).toString(2), '11000000000000000000000000000000', 'word left most -1')
    f = new Function('value', 'return ' + pack(32, 1, 2, 'value'))
    equal(f(0x3).toString(2), '1100000000000000000000000000000', 'word')
    f = new Function('value', 'return ' + pack(16, 13, 3, 'value'))
    equal(f(0xff).toString(2), '111', 'no left shift')
    f = new Function('value', 'return ' + pack(32, 29, 3, 'value'))
    equal(f(0xff).toString(2), '111', 'no left shift 32')
    equal(f(-1).toString(2), '111', 'no left shift 32 -1')
    equal(f(-4).toString(2), '100', 'no left shift 32 -4')
})
