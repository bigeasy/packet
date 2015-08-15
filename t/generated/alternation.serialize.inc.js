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

    serializers.object.prototype.serialize = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var frame = this.stack[this.stack.length - 1]

        for (;;) {
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
                        engine.start = start
                        return
                    }
                    buffer[start++] = frame.object.number >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5

            case 3:

                this.step = 4
                this.bite = 0

            case 4:

                while (this.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    buffer[start++] = frame.object.number >>> this.bite * 8 & 0xff
                    this.bite--
                }

                this.step = 5

                this.step = 5
            case 5:

                engine.start = start

            }
            break
        }

        engine.start = start

        return frame.object
    }

    return serializers
})()
