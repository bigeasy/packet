module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var step
        var bite
        var next
        var _foo

        this.write = function (buffer, start, end) {
            switch (step) {
            case 0:
                _foo = object["foo"]
                i = 0
                bite = 1
                step = 1
            case 1:
                do {
                    while (bite != -1) {
                        if (start == end) {
                            return start
                        }
                        buffer[start++] = _foo[i] >>> bite * 8 & 0xff
                        bite--
                    }
                    bite = 1
                } while (++i < 4)
            }

            if (next = callback && callback(object)) {
                this.write = next
                return this.write(buffer, start, end)
            }

            return start
        }

        return this.write(buffer, start, end)
    }

    return function (buffer, start, end) {
        var next
        var value
        var array
        var i
        var I

        if (end - start < 8) {
            return inc.call(this, buffer, start, end, 0)
        }

        array = object["foo"]
        for (i = 0; i < 4; i++) {
            value = array[i]
            buffer[start++] = value >>> 8 & 0xff
            buffer[start++] = value & 0xff
        }

        if (next = callback && callback(object)) {
            this.write = next
            return this.write(buffer, start, end)
        }

        return start
    }
}
