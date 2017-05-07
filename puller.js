var cadence = require('cadence')
var Parser = require('./parser.sketch')
var Staccato = require('staccato')

function Puller (stream) {
    this._stream = stream
    this._ranges = []
    this._staccato = new Staccato.Readable(stream)
}

Puller.prototype.parse = cadence(function (async, definition) {
    var parser = new Parser(definition)
    var loop = async(function () {
        if (this._ranges.length != 0) {
            var range = this._ranges[0]
            var outcome = parser.parse(range.buffer, range.start, range.buffer.length)
            if (outcome == null) {
                return [ loop.break, parser.object ]
            }
        } else {
            async(function () {
                this._staccato.read(async())
            }, function (buffer) {
                this._ranges.push({ buffer: buffer, start: 0 })
            })
        }
    })()
})

Puller.prototype.read = cadence(function (async, length) {
    if (this._ranges.length == 0) {
        async(function () {
            this._staccato.read(async())
        }, function (buffer) {
            this._ranges.push({ buffer: buffer, start: 0 })
            this.read(length, async())
        })
    } else {
        var range = this._ranges[0]
        var remaining = range.buffer.length - range.start
        var slice = range.buffer.slice(range.start, range.start + Math.min(remaining, length))
        range.start += slice.length
        if (range.start == range.buffer.length) {
            this._ranges.shift()
        }
        return slice
    }
})

module.exports = Puller
