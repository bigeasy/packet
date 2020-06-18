exports.writeDoubleBE = function (value) {
    const buffer = Buffer.alloc(8)
    buffer.writeDoubleBE(value)
    return buffer
}
exports.readDoubleBE = function (value) {
    return Buffer.from(value).readDoubleBE()
}
exports.writeFloatBE = function (value) {
    const buffer = Buffer.alloc(4)
    buffer.writeFloatBE(value)
    return buffer
}
exports.readFloatBE = function (value) {
    return Buffer.from(value).readFloatBE()
}
exports.writeDoubleLE = function (value) {
    const buffer = Buffer.alloc(8)
    buffer.writeDoubleLE(value)
    return buffer
}
exports.readDoubleLE = function (value) {
    return Buffer.from(value).readDoubleLE()
}
exports.writeFloatLE = function (value) {
    const buffer = Buffer.alloc(4)
    buffer.writeFloatLE(value)
    return buffer
}
exports.readFloatLE = function (value) {
    return Buffer.from(value).readFloatLE()
}
