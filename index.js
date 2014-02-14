var parse   = require('./tokenizer').parse

function rangify (pattern) {
    var ranges = [{ size: 0, fixed: true, pattern: [], patternIndex: 0 }]

    pattern.forEach(function (field, index) {
        ranges[0].size += field.bytes * field.repeat
        ranges[0].pattern.push(field)
    })

    return ranges
}

function Packetizer (options) {
    this._options = options
}

var fs = require('fs'), path = require('path')
var programmatic = require('programmatic')
var escodegen = require('escodegen')
var body = fs.readFileSync(path.join(__dirname, 'programmatic.s.js'), 'utf8')
var result = programmatic.generate(body).shift()
var source = escodegen.generate(result, { format: { semicolons: false } })

fs.writeFileSync(path.join(__dirname, 'programmatic.js'), source, 'utf8')

Packetizer.prototype.createParserProgrammatically  = function () {
    var generators = require('./programmatic')
    var source = escodegen.generate(generators.parser(1), { format: { semicolons: false } })
    fs.writeFileSync(path.join(__dirname, 'programmatic.b8n.js'), source, 'utf8')
    return require('./programmatic.b8n')
}

Packetizer.prototype.createParser = function (pattern) {
    var pattern = parse(pattern)
    var ranges = rangify(pattern)
    var prefix = [ 'parse.bff' ]

    var parser = require('./composers').composeParser(ranges, true)

    parser = parser.replace(/\n\n\n+/, '\n\n').split(/\n/)

    return this._options.precompiler(prefix.join('.'), pattern, [ 'object', 'callback' ], parser)
}

Packetizer.prototype.createSerializer = function (pattern) {
    var pattern = parse(pattern)
    var ranges = rangify(pattern)
    var prefix = [ 'serialize.bff' ]

    var serializer = require('./composers').composeSerializer(ranges, true)

    serializer = serializer.replace(/\n\n\n+/, '\n\n').split(/\n/)

    return this._options.precompiler(prefix.join('.'), pattern, [ 'object', 'callback' ], serializer)
}

Packetizer.prototype.createSizeOf = function (pattern) {
    var pattern = parse(pattern)
    var ranges = rangify(pattern)
    var prefix = [ 'sizeOf' ]

    var sizeOf = require('./composers').composeSizeOf(ranges)

    sizeOf = sizeOf.split(/\n/)

    return this._options.precompiler(prefix.join('.'), pattern, [ 'object' ], sizeOf)
}

function createPacketizer (options) {
    return new Packetizer(options || {})
}

exports.createPacketizer = createPacketizer
