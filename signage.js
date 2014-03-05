function signage (name, width, bits) {
    var mask = 0xffffffff, test = 1
    mask = mask >>> (32 - bits)
    test = test << (width - 1)
    return name + ' & 0x' + test.toString(16) +
        ' ? (0x' + mask.toString(16) + ' - ' + name + ' + 1) * -1 : ' + name
}

console.log(signage('foo', 16, 3))
