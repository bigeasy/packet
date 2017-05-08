var packet = require('../../..')
// Bargle.
exports.object = (function () {
    var parsers = require('../generated/integer.parse.all')
    return parsers.all.object
})()
