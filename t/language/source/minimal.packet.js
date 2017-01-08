var packet = require('packet')
// Bargle.
exports.object = packet(function (object) {
    _(object.value, 16)
})
