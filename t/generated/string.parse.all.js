module.exports = function (parsers) {
    parsers.all.object = function () {
    }

    parsers.all.object.prototype.parse = function (buffer, start) {

        var index
        var object
        var terminator

        object = {
            string: null
        }

        var terminator = [0]
        var index = buffer.indexOf(new Buffer(terminator), start)
        object.string = buffer.toString("utf8", start, index)
        start = index + terminator.length

        return { start: start, object: object, parser: null }
    }
}
