module.exports = (function () {
    var parsers = {}

    parsers.object = function () {
    }

    parsers.object.prototype.parse = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var object

        object = {
            word: null
        }

        object.word = buffer[start++]

        engine.start = start

        return object
    }

    return parsers
})()
