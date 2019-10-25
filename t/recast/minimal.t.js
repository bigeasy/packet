require('proof')(3, require('cadence')(prove))

function prove (async, assert) {
    var recast = require('recast')
    var fs = require('fs')
    var composer = require('../../parse.all')
    var $ = require('programmatic')

    var source = fs.readFileSync('t/language/source/minimal.packet.js')
    var ast = recast.parse(source)

    console.log(ast)
    var parser = require('../../parser')
    var structures = parser.astWalk(ast.program, '../../..')

    var exported = null

    var source = $(`
        (function () {
            var parsers = { all: {} }
            require(\'../generated/integer.parse.all\')(parsers)
            return parsers.all.object
        })()
    `)

    var _ast = recast.parse(source)

    composer(function (source) {
        exported = $(`
        (function () {
            var parsers = { all: {} }

            `, source, `

            return function () {
                new parser.all.object()
            }
        })()
        `)
    }, structures.parse)
    var exported = recast.print(_ast).code

    function walk (ast) {
        ast.program.body.forEach(function (node) {
            if (node.type == 'ExpressionStatement') {
                node.expression.right = recast.parse(exported).program.body[0]
            }
        })
    }

    walk(ast)

    ast.program.body.shift()

    fs.writeFileSync('t/generated/parse.minimal.recast.all.js', recast.print(ast).code, 'utf8')
    var minimalParser = require('../generated/parse.minimal.recast.all.js')

    var minimal = require('../language/source/minimal.packet.js')
    var Serializer = require('../../serializer.sketch')
    var Parser = require('../../parser.sketch')

    var toJSON = require('../to-json')

    var object = { value: 0xaaaa }

    var serializer = new Serializer(minimal.object, object)

    var buffer = new Buffer(2)
    serializer.write(buffer, 0, buffer.length)

    assert(toJSON(buffer), [ 0xaa, 0xaa ], 'serialize')

    var parser = new minimalParser.object
    var outcome = parser.parse(buffer, 0, buffer.length)

    assert(outcome.object, { integer: 0xaaaa }, 'parse')

    var stream = require('stream')
    var Puller = require('../../puller')
    var through = new stream.PassThrough
    var puller = new Puller(through)

    async(function () {
        puller.parse(minimal.object, async())
        through.write(buffer)
    }, function (object) {
        assert(object, { value: 0xaaaa }, 'puller parse')
    })
}
