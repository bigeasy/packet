(((-1 << 4) & 0x70) >>> 0).toString(16)
function pack (bits, offset, size) {
    var mask = 0xffffffff
    mask = mask >>> 32 - bits
    mask = mask >>> bits - size
    shift = bits - offset - size
    mask = mask << shift >>> 0
    return '(value << ' + shift + ' & 0x' + mask.toString(16) + ') >>> 0)'
}

console.log('object["three"] = ' + pack(16, 5, 7))
console.log('object["three"] = ' + pack(32, 0, 2))
