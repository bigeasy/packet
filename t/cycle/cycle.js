var path = require('path')
var compiler = require('../../compiler/require')
var transmogrify = require('../../transmogrifier')
var toJSON = require('../to-json')
// TODO: Make compiler a function that takes a prefix, then compile the four.
var composers = {
    parser: {
        inc: require('../../compose/parser/inc.js'),
        all: require('../../compose/parser/all.js')
    },
    serializer: {
        inc: require('../../compose/serializer/inc.js'),
        all: require('../../compose/serializer/all.js')
    }
}
var Writer = require('../../writer')

module.exports = function (assert) {
    return function (options) {
        var transmogrified = transmogrify(options.define)
        console.log(options)
        var filename = path.resolve(__filename, '../../generated/' + options.name)
        var engines = {
            parser: {
                inc: composers.parser.inc(compiler(filename + '.parser.inc.js'), transmogrified),
                all: composers.parser.all(compiler(filename + '.parser.all.js'), transmogrified)
            },
            serializer: {
                inc: composers.serializer.inc(compiler(filename + '.serializer.inc.js'), transmogrified),
                all: composers.serializer.all(compiler(filename + '.serializer.all.js'), transmogrified)
            }
        }
        var writer = new Writer(engines, 'object', options.object)
        var cursor = Writer.cursor(new Buffer(options.buffer.length))
        cursor = writer.write(cursor)
        assert(toJSON(cursor.buffer), options.buffer, options.name + ' whole')
    }
}
