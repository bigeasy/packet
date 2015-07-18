module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var step
        var bite
        var next
        var i

        this.write = function (buffer, start, end) {
            switch (step) {
            case 0:
                value = object.foo.length
                bite = 1
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    buffer[start++] = value >>> bite * 8 & 0xff
                    bite--
                }
            case 2:
                array = object.foo
                i = 0
                bite = 1
                step = 3
            case 3:
                do {
                    while (bite != -1) {
                        if (start == end) {
                            return start
                        }
                        buffer[start++] = array[i] >>> bite * 8 & 0xff
                        bite--
                    }
                    bite = 1
                } while (++i < array.length)
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
        var length
        var value
        var array
        var i
        var I

        if (end - start < 2) {
            return inc.call(this, buffer, start, end, 0)
        }

        length = object["foo"].length
        buffer[start++] = value >>> 8 & 0xff
        buffer[start++] = value & 0xff

        if (end - start < value) {
            return inc.call(this, buffer, start, end, 2)
        }

        array = object["foo"]
        for (i = 0; i < length; i++) {
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
