require('proof')(8, function (equal) {
    require('../..') // satisfy coverage

    function pack (bits, offset, size) {
        var mask = 0xffffffff, shift
        mask = mask >>> 32 - bits
        mask = mask >>> bits - size
        shift = bits - offset - size
        mask = mask << shift >>> 0
        var source = shift
                   ? 'value << ' + shift + ' & 0x' + mask.toString(16)
                   : 'value & 0x' + mask.toString(16)
        return !offset && bits == 32 ? '(' + source + ') >>> 0' : source
    }

    var f = new Function('value', 'return ' + pack(16, 5, 7))
    equal(f(0x7f).toString(2), '11111110000', 'short')
    var f = new Function('value', 'return ' + pack(32, 0, 2))
    equal(f(0x3).toString(2), '11000000000000000000000000000000', 'word left most')
    equal(f(-1).toString(2), '11000000000000000000000000000000', 'word left most -1')
    var f = new Function('value', 'return ' + pack(32, 1, 2))
    equal(f(0x3).toString(2), '1100000000000000000000000000000', 'word')
    var f = new Function('value', 'return ' + pack(16, 13, 3))
    equal(f(0xff).toString(2), '111', 'no left shift')
    var f = new Function('value', 'return ' + pack(32, 29, 3))
    equal(f(0xff).toString(2), '111', 'no left shift 32')
    equal(f(-1).toString(2), '111', 'no left shift 32 -1')
    equal(f(-4).toString(2), '100', 'no left shift 32 -4')
})
