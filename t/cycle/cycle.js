var path = require('path')
var compiler = require('../../require')
var transmogrify = require('../../transmogrifier')
var util = require('util')
var toJSON = require('../to-json')
// TODO: Make compiler a function that takes a prefix, then compile the four.
var composers = {
    parser: {
        inc: require('../../parse.inc'),
        all: require('../../parse.all')
    },
    serializer: {
        inc: require('../../serialize.inc'),
        all: require('../../serialize.all')
    }
}
var Writer = require('../../writer')

module.exports = function (assert) {
    return function (options) {
        var transmogrified = transmogrify(options.define)
        var filename = path.resolve(__filename, '../../generated/' + options.name)
        var parsers = { all: {}, inc: {}, bff: {} }
        var serializers = { all: {}, inc: {}, bff: {} }
        composers.parser.inc(
            compiler('parsers', filename + '.parser.inc.js'),
            transmogrified
        )(parsers)
        composers.parser.all(
            compiler('parsers', filename + '.parser.all.js'),
            transmogrified
        )(parsers)
        composers.serializer.inc(
            compiler('serializers', filename + '.serializer.inc.js'),
            transmogrified
        )(serializers)
        composers.serializer.all(
            compiler('serializers', filename + '.serializer.all.js'),
            transmogrified
        )(serializers)
        var engines = { parsers: parsers, serializers: serializers }
        var writer = new Writer(engines, 'object', options.object)
        var cursor = Writer.cursor(new Buffer(options.buffer.length))
        cursor = writer.write(cursor)
        assert(toJSON(cursor.buffer), options.buffer, options.name + ' whole')
    }
}
