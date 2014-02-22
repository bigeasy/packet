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
    return this._load('parse.bff', pattern)
}

Packetizer.prototype.createSerializer = function (pattern) {
    return this._load('serialize.bff', pattern)
}

Packetizer.prototype.createSizeOf = function (pattern) {
    return this._load('sizeOf', pattern)
}

function createPacketizer (options) {
    return new Packetizer(options || {})
}

exports.createPacketizer = createPacketizer
