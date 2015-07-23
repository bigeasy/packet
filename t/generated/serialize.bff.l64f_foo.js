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
                _foo = new ArrayBuffer(8)
                new DataView(_foo).setFloat64(0, object. foo, true)
                bite = 0
                step = 1
            case 1:
                while (bite != 8) {
                    if (start == end) {
                        return start
                    }
                    buffer[start++] = _foo[bite]
                    bite++
                }
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

        if (end - start < 8) {
            return inc.call(this, buffer, start, end, 0)
        }

        value = new ArrayBuffer(8)
        new DataView(value).setFloat64(0, object.foo, true)
        buffer[start++] = value[0]
        buffer[start++] = value[1]
        buffer[start++] = value[2]
        buffer[start++] = value[3]
        buffer[start++] = value[4]
        buffer[start++] = value[5]
        buffer[start++] = value[6]
        buffer[start++] = value[7]
        if (next = callback && callback(object)) {
            this.write = next
            return this.write(buffer, start, end)
        }

        return start
    }
}
