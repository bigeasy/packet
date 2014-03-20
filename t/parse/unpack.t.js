require('proof')(2, function (equal) {
    require('../..') // satisfy coverage
    function unpack (bits, offset, length) {
        var mask = 0xffffffff, shift
        mask = mask >>> (32 - bits)
        mask = mask >>> (bits - length)
        shift = bits - offset - length
        shift = shift ? 'value >>> ' + shift : 'value'
        return shift + ' & 0x' + mask.toString(16)
    }

    var f = new Function('value', 'return ' + unpack(16, 4, 8))
    equal(f(0x0aa0).toString(16), 'aa', 'unpack')
    console.log(unpack(16, 4, 8))
    console.log(unpack(16, 12, 4))
    var f = new Function('value', 'return ' + unpack(16, 12, 4))
    equal(f(0x000a).toString(16), 'a', 'unpack no shift')
})
