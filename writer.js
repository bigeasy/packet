function Writer (engines, name, object) {
    this._engines = engines
    this._name = name
    this._object = object
    this._serializer = new (engines.serializer.inc[name])(object)
}

Writer.prototype.write = function (cursor) {
    console.log(this)
    this._serializer.serialize(cursor)
    cursor.consumed = cursor.start == cursor.end
    return cursor
}

Writer.cursor = function (buffer) {
    return { buffer: buffer, start: 0, end: buffer.length, consumed: false }
}

module.exports = Writer
