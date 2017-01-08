var packet = require('packet')

exports.object = packet(function (object) {
    _(object.flag, 8)
    if (object.flag == 16) {
        _(object.number, 16)
    } else if (object.flag == 24) {
        _(object.number, 24)
    } else {
        _(object.number, 32)
    }
})
