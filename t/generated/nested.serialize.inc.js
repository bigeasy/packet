module.exports = (function () {
    var serializers = {}

    serializers.object = function (object) {
        this.step = 0
        this.bite = 0
        this.stop = 0
        this.stack = [{
            object: object,
            index: 0,
            length: 0
        }]
    }

    serializers.object.prototype.serialize = function (buffer, start, end) {
        var frame = this.stack[this.stack.length - 1]

        SERIALIZE: for (;;) {
            switch (this.step) {
            case 0:

                this.step = 1
                this.bite = 1

            case 1:

                while (this.bite != -1) {
                    if (start == end) {
                        return { start: start, serializer: this }
                    }
                    buffer[start++] = frame.object.values.length >>> this.bite * 8 & 0xff
                    this.bite--
                }


                this.step = 2

            case 2:

                this.stack.push(frame = {
                    object: frame.object.values[frame.index],
                    index: 0
                })
                this.step = 3

            case 3:

                this.step = 4
                this.bite = 1

            case 4:

                while (this.bite != -1) {
                    if (start == end) {
                        return { start: start, serializer: this }
                    }
                    buffer[start++] = frame.object.key >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5

            case 5:

                this.step = 6
                this.bite = 1

            case 6:

                while (this.bite != -1) {
                    if (start == end) {
                        return { start: start, serializer: this }
                    }
                    buffer[start++] = frame.object.value >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 7

                this.stack.pop()
                frame = this.stack[this.stack.length - 1]
                if (++frame.index != frame.object.values.length) {
                    this.step = 2
                    continue
                }
                this.step = 7

            case 7:

                break SERIALIZE

            }
        }

        return { start: start, serializer: null }
    }

    return serializers
})()
