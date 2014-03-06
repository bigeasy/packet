require('proof')(3, function (equal) {
    require('../..') // satisfy coverage

    function pack (bits, offset, size) {
        var mask = 0xffffffff, shift
        mask = mask >>> 32 - bits
        mask = mask >>> bits - size
        shift = bits - offset - size
        mask = mask << shift >>> 0
        if (shift) {
            return '(value << ' + shift + ' & 0x' + mask.toString(16) + ') >>> 0'
        } else {
            return '(value & 0x' + mask.toString(16) + ') >>> 0'
        }
    }

    var f = new Function('value', 'return ' + pack(16, 5, 7))
    equal(f(0x7f).toString(2), '11111110000', 'short')
    var f = new Function('value', 'return ' + pack(32, 0, 2))
    equal(f(0x3).toString(2), '11000000000000000000000000000000', 'short')
    console.log(pack(16, 13, 3))
    var f = new Function('value', 'return ' + pack(16, 13, 3))
    equal(f(0xff).toString(2), '111', 'no left shift')
})
