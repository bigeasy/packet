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
