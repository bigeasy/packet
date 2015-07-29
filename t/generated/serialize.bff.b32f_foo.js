module.exports = function (object, callback) {
    var inc

    inc = function (buffer, start, end, step) {
        var step
        var bite
        var next
        var value

        this.write = function (buffer, start, end) {
            switch (step) {
            case 0:
                value = new ArrayBuffer(4)
                new DataView(value).setFloat32(0, object. foo, true)
                bite = 3
                step = 1
            case 1:
                while (bite != -1) {
                    if (start == end) {
                        return start
                    }
                    buffer[start++] = value[bite]
                    bite--
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

        if (end - start < 4) {
            return inc.call(this, buffer, start, end, 0)
        }

        value = new ArrayBuffer(4)
        new DataView(value).setFloat32(0, object.foo, true)
        buffer[start++] = value[3]
        buffer[start++] = value[2]
        buffer[start++] = value[1]
        buffer[start++] = value[0]
        if (next = callback && callback(object)) {
            this.write = next
            return this.write(buffer, start, end)
        }

        return start
    }
}
