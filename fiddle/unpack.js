// TODO Module tidy; find a better name, better place to live.
function unpack (bits, offset, length, assignee) {
    var mask = 0xffffffff, shift
    mask = mask >>> (32 - bits)
    mask = mask >>> (bits - length)
    shift = bits - offset - length
    shift = shift ? `${assignee} >>> ` + shift : assignee
    return shift + ' & 0x' + mask.toString(16)
}

module.exports = unpack
