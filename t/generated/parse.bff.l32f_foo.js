module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, index) {
        var bite
        var next
        var _foo

        this.parse = function (buffer, start, end) {
            switch (index) {
            case 0:
                _foo = new ArrayBuffer(4)
                bite = 0
                index = 1
            case 1:
                while (bite != 4) {
                    if (start == end) {
                        return start
                    }
                    _foo[bite] = buffer[start++]
                    bite++
                }
                _foo = new DataView(_foo).getFloat32(0, true)
                object["foo"] = _foo
            }

            if (next = callback(object)) {
                this.parse = next
                return this.parse(buffer, start, end)
            }

            return start
        }

        return this.parse(buffer, start, end)
    }

    return function (buffer, start, end) {
        var next
        var _foo

        if (end - start < 4) {
            return inc.call(this, buffer, start, end, 0)
        }

        _foo = new ArrayBuffer(4)
        _foo[0] = buffer[start++]
        _foo[1] = buffer[start++]
        _foo[2] = buffer[start++]
        _foo[3] = buffer[start++]
        object["foo"] = new DataView(_foo).getFloat32(0, true)

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
