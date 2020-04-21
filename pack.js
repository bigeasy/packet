function pack (bits, offset, size, value) {
    let mask = 0xffffffff, shift
    mask = mask >>> 32 - bits
    mask = mask >>> bits - size
    shift = bits - offset - size
    mask = mask << shift >>> 0
    const source = shift
               ? value + ' << ' + shift + ' & 0x' + mask.toString(16)
               : value + ' & 0x' + mask.toString(16)
    return !offset && bits == 32 ? '(' + source + ') >>> 0' : source
}

module.exports = pack
