module.exports = (function () {
    var serializers = {}

    serializers.object = function (object) {
        this.step = 0
        this.bite = 0
        this.stop = 0
        this.stack = [ object ]
    }

    serializers.object.prototype.serialize = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var object = this.stack[this.stack.length - 1]

        var i
        var length

        for (;;) {
            switch (this.step) {
            case 0:

                this.step = 1
                this.bite = 1

            case 1:

                while (this.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    buffer[start++] = object.values.length >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 2

            case 2:

                this.stack[this.stack.length - 1].index = 0
                this.stack.push({
                    object: {
                        key: null,
                        value: null
                    }
                })

            case 3:

                this.step = 4
                this.bite = 1

            case 4:

                while (this.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    buffer[start++] = object.key >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5

            case 5:

                this.step = 6
                this.bite = 1

            case 6:

                while (this.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    buffer[start++] = object.value >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 7

                frame = this.stack[this.stack.length - 2]
                frame.object.values.push(this.stack.pop().object)
                if (++frame.index != frame.length) {
                    this.step = 2
                    continue
                }
            }
            return
        }

        engine.start = start

        return frame.object
    }

    return serializers
})()
