var parse   = require('./tokenizer').parse
var composers = {
    composeSerializer: require('./composers/serializers/bff'),
    composeParser: require('./composers/parsers/bff'),
    composeSizeOf: require('./composers/sizeof')
}

function padify (pattern) {
    var padded = []
    pattern.forEach(function (field) {
        if (field.padding) {
            padded.push({
                endianess: 'padding',
                padding: field.padding,
                name: field.name,
                bytes: field.bytes,
                repeat: field.repeat
            })
        }
        padded.push(field)
    })
    return padded
}

function rangify (pattern) {
    pattern = padify(pattern)

    pattern.forEach(function (field, index) {
        field.index = index
    })

    var ranges = [{ size: 0, fixed: true, pattern: [] }]

    pattern.forEach(function (field, index) {
        ranges[ranges.length - 1].size += field.bytes * field.repeat
        ranges[ranges.length - 1].pattern.push(field)
        if (field.lengthEncoding) {
            ranges[ranges.length - 1].name = pattern[index + 1].name
            ranges.push({
                lengthEncoded: true,
                size: 0,
                fixed: false,
                pattern: []
            })
        }
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

    var parser = composers.composeParser(ranges)

    return this._options.precompiler(prefix.join('.'), _pattern, [ 'object', 'callback' ], parser)
}


Packetizer.prototype.createSerializer = function (pattern) {
    var _pattern = parse(pattern)
    var ranges = rangify(_pattern)
    var prefix = [ 'serialize.bff' ]

    var serializer = composers.composeSerializer(ranges)

    return this._options.precompiler(prefix.join('.'), _pattern, [ 'object', 'callback' ], serializer)
}

Packetizer.prototype.createSizeOf = function (pattern) {
    var pattern = parse(pattern)
    var ranges = rangify(pattern)
    var prefix = [ 'sizeOf' ]

    var sizeOf = composers.composeSizeOf(ranges)

    return this._options.precompiler(prefix.join('.'), pattern, [ 'object' ], sizeOf)
}

function createPacketizer (options) {
    return new Packetizer(options || {})
}

exports.createPacketizer = createPacketizer
