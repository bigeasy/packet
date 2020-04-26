function unsign (name, width, bits) {
    let mask = 0xffffffff, test = 1
    mask = mask >>> (32 - bits)
    test = test << bits - 1 >>> 0
    return `${name} & 0x${test.toString(16)} ? (0x${mask.toString(16)} - ${name}  + 1) * -1 : ${name}`
}

module.exports = unsign
