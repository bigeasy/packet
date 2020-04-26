function sign (name, width, bits) {
    if (bits == 32) {
        return `${name} < 0 ? (~Math.abs(${name}) >>> 0) + 1 : ${name}`
    }
    let mask = 0xffffffff, test = 1
    mask = mask >>> (32 - bits)
    return `${name} < 0 ? (~Math.abs(${name}) & 0x${mask.toString(16)}) + 1 : ${name}`
}

module.exports = sign
