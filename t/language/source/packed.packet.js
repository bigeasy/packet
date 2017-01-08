var packet = require('packet')

exports.object = packet(function (object) {
    _(object, { flag: 1, small: 3, remaining: 12 })
})
