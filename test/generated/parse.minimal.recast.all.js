// Bargle.
exports.object = (function () {
    var parsers = { all: {} }
    require('../generated/integer.parse.all')(parsers)
    return parsers.all.object
})()
