function composeSizeOf (ranges) {
    var fixed = 0

    ranges.forEach(function (range) {
        if (range.fixed) {
            range.pattern.forEach(function (field) {
                fixed += field.bytes * field.repeat
            })
        }
    })

    return 'return ' + fixed
}

module.exports = composeSizeOf
