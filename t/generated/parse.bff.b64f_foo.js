module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var value
        var bite
        var next

        this.parse = function (buffer, start, end) {
            switch (step) {
            case 0:
                value = new ArrayBuffer(8)
                bite = 7
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    value[bite] = buffer[start++]
                    bite--
                }
                object.foo = new DataView(value).getFloat64(0, true)
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

        if (end - start < 8) {
            return inc.call(this, buffer, start, end, 0)
        }

        value = new ArrayBuffer(8)
        value[7] = buffer[start++]
        value[6] = buffer[start++]
        value[5] = buffer[start++]
        value[4] = buffer[start++]
        value[3] = buffer[start++]
        value[2] = buffer[start++]
        value[1] = buffer[start++]
        value[0] = buffer[start++]
        object.foo = new DataView(value).getFloat64(0, true)

        if (next = callback(object)) {
            this.parse = next
            return this.parse(buffer, start, end)
        }

        return start
    }
}
