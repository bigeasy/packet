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

        SERIALIZE: for (;;) {
            switch (this.step) {
            case 0:

                frame = this.stack[this.stack.length - 1]

                if (128 <= frame.object.number) {

                    this.step = 1
                    continue

                } else {

                    this.step = 3
                    continue

                }

            case 1:

                this.step = 2
                this.bite = 1

            case 2:

                while (this.bite != -1) {
                    if (start == end) {
                        return { start: start, serializer: this }
                    }
                    buffer[start++] = frame.object.number >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5
                continue

            case 3:

                this.step = 4
                this.bite = 0

            case 4:

                while (this.bite != -1) {
                    if (start == end) {
                        return { start: start, serializer: this }
                    }
                    buffer[start++] = frame.object.number >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5
                continue

                this.step = 5

            case 5:

                break SERIALIZE

            }
        }

        return { start: start, serializer: null }
    }
}
