var $ = require('programmatic')

function unpack (bits, offset, length) {
    var mask = 0xffffffff
    mask = mask >>> (32 - bits)
    mask = mask >>> (bits - length)
    shift = bits - offset - length
    shift = shift ? 'value >>> ' + shift : 'value'
    return shift + ' & 0x' + mask.toString(16)
}

console.log('object["three"] = ' + unpack(16, 10, 5))
