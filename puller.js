function Puller (engines, name) {
    this._engines = engines
    this._name = name
}

Puller.currsor = function (buffer) {
    return { buffer: buffer, index: 0, length: buffer.length }
}

Puller.prototype.read = function (cursor) {
}

module.exports = Puller
