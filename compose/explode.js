// Explode a field specified in the intermediate language, filling in all the
// properties needed by a generator. Saves the hastle and clutter of repeating
// these calculations as needed.

function explode (field) {
    var little = field.endianess === 'l'
    var bytes = field.bits / 8
    return {
        name: field.name,
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
