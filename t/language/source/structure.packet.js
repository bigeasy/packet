var packet = require('packet')

exports.object = packet(function (object) {
    _(object.header, function (header) { _(header.value, 16) })
})
