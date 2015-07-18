module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var _undefined
        var byte
        var next
        var i

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                length = 0
                bite = 1
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    length += Math.pow(256, bite) * buffer[start++]
                    bite--
                }
                object.foo = new Array(length)
            case 2:
                array = object.foo
                if (array.length !== 0) {
                    array[0] = 0
                }
                i = 0
                bite = 1
                step = 3
            case 3:
                for (;;) {
                    while (bite != -1) {
                        if (start == end) {
                            return start
                        }
                        array[i] += Math.pow(256, bite) * buffer[start++]
                        bite--
                    }
                    if (++i === array.length) {
                        break
                    }
                    array[i] = 0
                    bite = 1
                }
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
        var value
        var array
        var i

        if (end - start < 2) {
            return inc.call(this, buffer, start, end, 0)
        }

        value =
            buffer[start++] * 0x100 +
            buffer[start++]
        object.foo = array = new Array(value)

        if (end - start < value) {
            return inc.call(this, buffer, start, end, 2)
        }

        object.foo = array = new Array(value)
        for (i = 0; i < value; i++) {
            array[i] =
                buffer[start++] * 0x100 +
                buffer[start++]
        }
        object["foo"] = array

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
