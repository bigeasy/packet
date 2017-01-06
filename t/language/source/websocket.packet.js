exports.object = function (object) {
    _(object.header, function (header) {
        _(header, { fin: 1, rsv1: 1, rsv2: 1, rsv3: 1, opcode: 4, mask: 1, length: 7 })
    })
    if (object.header.length == 127) {
        _(object.length, 16)
    } else if (object.header.length == 126) {
        _(object.length, 32)
    }
    if (object.header.mask == 1) {
        _(object.mask, 16)
    }
}
