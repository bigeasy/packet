var interrupt = require('interrupt').createInterrupter('packet')
var rescue = require('rescue')

function Parser (definition) {
    this._definition = definition
    this.object = {}
    this._buffer = new Buffer('')
}

Parser.prototype.parse = function (buffer, start, end) {
    if (this._buffer.length != 0) {
        start = 0
        end += this._buffer.length
        buffer = Buffer.concat([ this.buffer, buffer ])
    }
    var object = this.object
    function packet () {
        var vargs = Array.prototype.slice.call(arguments)
        var name = vargs.shift()
        var size = vargs.shift()
        var bytes = size / 16
        var value = 0
        var bite = 1
        var offset = -1
        object[name] = 0
        while (bite != -1) {
            object[name] += Math.pow(256, bite--) * buffer[start++]
        }
    }
    packet.serializing = true
    packet.parsing = false
    try {
        this._definition.call(null, packet, this.object)
    } catch (error) {
        rescue(/^packet#underflow$/m, function () {
            this._buffer = buffer
        }).call(this, error)
    }
}

module.exports = Parser
