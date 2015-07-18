module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var byte
        var next
        var i

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                array = new Array(4)
                if (array.length !== 0) {
                    array[0] = 0
                }
                i = 0
                bite = 1
                step = 1
            case 1:
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
        var array
        var i

        if (end - start < 8) {
            return inc.call(this, buffer, start, end, 0)
        }

        object.foo = array = new Array(4)
        for (i = 0; i < 4; i++) {
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
