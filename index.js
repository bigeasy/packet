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

var fs = require('fs'), path = require('path'), namify = require('./t/name')

Packetizer.prototype._load = function (prefix, pattern) {
    var pattern = parse(pattern)
    var name = namify(prefix, pattern)
    return require(path.join(__dirname, 't', 'generated', name + '.js'))
}

Packetizer.prototype.createParser = function (pattern) {
    var _pattern = parse(pattern)
    var ranges = rangify(_pattern)
    var prefix = [ 'parse.bff' ]

    var parser = require('./composers').composeParser(ranges)

    return this._options.precompiler(prefix.join('.'), _pattern, [ 'object', 'callback' ], parser)
}


Packetizer.prototype.createSerializer = function (pattern) {
    var _pattern = parse(pattern)
    var ranges = rangify(_pattern)
    var prefix = [ 'serialize.bff' ]

    var serializer = require('./composers').composeSerializer(ranges)

    return this._options.precompiler(prefix.join('.'), _pattern, [ 'object', 'callback' ], serializer)
}

Packetizer.prototype.createSizeOf = function (pattern) {
    var pattern = parse(pattern)
    var ranges = rangify(pattern)
    var prefix = [ 'sizeOf' ]

    var sizeOf = require('./composers').composeSizeOf(ranges)

    return this._options.precompiler(prefix.join('.'), pattern, [ 'object' ], sizeOf)
}

function createPacketizer (options) {
    return new Packetizer(options || {})
}

exports.createPacketizer = createPacketizer
