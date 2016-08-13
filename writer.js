function Writer (engines, name, object) {
    this._engines = engines
    this._name = name
    this._object = object
    this._serializer = new (engines.serializers.inc[name])(object)
}

Writer.prototype.write = function (cursor) {
    console.log(this)
    var result = this._serializer.serialize(cursor.buffer, cursor.start, cursor.end)
    cursor.start = result.start
    return cursor
}

Writer.cursor = function (buffer) {
    return { buffer: buffer, start: 0, end: buffer.length, consumed: false }
}

module.exports = Writer
