var interrupt = require('interrupt').createInterrupter('packet')
var rescue = require('rescue')

function Serializer (definition, object) {
    this._definition = definition
    this._object = object
    this._buffer = new Buffer('')
}

Serializer.prototype.write = function (buffer, start, end) {
    if (this._buffer.length != 0) {
        start = 0
        end += this._buffer.length
        buffer = Buffer.concat([ this.buffer, buffer ])
    }
    var object = this._object
    function packet () {
        var vargs = Array.prototype.slice.call(arguments)
        var name = vargs.shift()
        var size = vargs.shift()
        var bytes = size / 16
        var value = 0
        var bite = 1
        var offset = -1
        for (var i = 0; i <= bytes; i++) {
            buffer[start++] = object[name] >>> bite * 8 & 0xff
            bite += offset
        }
    }
    packet.serializing = true
    packet.parsing = false
    try {
        this._definition.call(null, packet, this._object)
    } catch (error) {
        rescue(/^packet#underflow$/m, function () {
            this._buffer = buffer
        }).call(this, error)
    }
}

module.exports = Serializer
