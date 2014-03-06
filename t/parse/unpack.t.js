require('proof')(1, function (equal) {
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
})
