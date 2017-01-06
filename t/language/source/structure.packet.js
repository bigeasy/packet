exports.object = function (object) {
    _(object.header, function (header) { _(header.value, 16) })
}
