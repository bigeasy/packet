module.exports = function (serializers) {
    serializers.inc.object = function (object) {
        this.step = 0
        this.bite = 0
        this.stop = 0
        this.stack = [{
            object: object,
            index: 0,
            length: 0
        }]
    }

    serializers.inc.object.prototype.serialize = function (buffer, start, end) {
        var frame = this.stack[this.stack.length - 1]

        switch (this.step) {
        case 0:

            this.step = 1
            this.bite = 3

        case 1:

            while (this.bite != -1) {
                if (start == end) {
                    return { start: start, serializer: this }
                }
                buffer[start++] = frame.object.integer >>> this.bite * 8 & 0xff
                this.bite--
            }

            this.step = 2

        case 2:

            break

        }

        return { start: start, serializer: null }
    }
}
