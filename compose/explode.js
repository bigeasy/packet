function explode (field) {
    var little = field.endianess === 'l'
    var bytes = field.bits / 8
    return {
        length: field.length,
        endianness: field.endianess,
        type: 'integer',
        little: little,
        bite: little ? 0 : bytes - 1,
        direction: little ? 1 : -1,
        stop: little ? bytes : -1,
        bits: field.bits,
        bytes: bytes
    }
}

module.exports = explode
