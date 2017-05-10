var source = require('./embedded.json')
var compiler = require('./require')
var Blocker = require('blocker')
var stream = require('stream')
var cadence = require('cadence')
var abend = require('abend')

var parsers = { all: {} }
var composer = require('./parse.all')
composer(compiler('parsers', './embedded.parsers.js'), source.parse)(parsers)

var serializers = { all: {} }
var composer = require('./serialize.all')
composer(compiler('serializers', './embedded.serializers.js'), source.serialize)(serializers)

var device = {
    attributes: [{
        attributeId: 1, value: 'a'
    }, {
        attributeId: 2, value: 'b'
    }, {
        attributeId: 3, value: 'c'
    }]
}

var buffers = { header: [], packet: [] }
var serializer = new serializers.all.device(device)
var buffer = []

serializer.serialize(buffers.packet, 0)

var frame = {
    packet: 1,
    length: buffers.packet.length
}

var serializer = new serializers.all.frame(frame)

serializer.serialize(buffers.header, 0)

var buffer = Buffer.concat([ new Buffer(buffers.header), new Buffer(buffers.packet) ])

var stream = new stream.PassThrough

cadence(function (async) {
    var blocker = new Blocker(stream)
    async(function () {
        blocker.block(8, async())
    }, function (buffer) {
        var parser = new parsers.all.frame
        var header = parser.parse(buffer, 0).object
        async(function () {
            blocker.block(header.length, async())
        }, function (buffer) {
            switch (header.packet) {
            case 1:
                var parser = new parsers.all.device
                var packet = parser.parse(buffer, 0).object
                console.log(header, packet)
                break
            }
        })
    })
})(abend)

stream.write(buffer)
