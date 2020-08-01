//

// If all sizes are the same and the upper bits are the same we use a loop
// to serialize, otherwise we unroll the loop into separate steps.
exports.serialize = function (field) {
    return (
        field.bytes.every(({ size }) => size == field.bytes[0].size) &&
        field.bytes.every(({ upper }) => upper == field.bytes[0].upper)
    )
}
//

// If all sizes are the same and all bytes agree as to whether they need a
// mask to remove top bits or on not need a mask to remove top bits, we use
// a loop to parse, otherwise we unroll the loop into separate steps.
exports.parse = function (field) {
    return (
        field.bytes.every(({ size }) => size == field.bytes[0].size) &&
        field.bytes.every(({ upper }) => !! upper == !! field.bytes[0].upper)
    )
}
