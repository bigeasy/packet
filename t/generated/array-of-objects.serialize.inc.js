module.exports = (function () {
    var parsers = {}

    parsers.object = function (object) {
        this.step = 0
        this.stack = [ object ]
    }

    parsers.object.prototype.serialize = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var object = this.stack[this.stack.length - 1]

        var i
        var length

        for (;;) {
            switch (this.step) {
            case 0:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 1

            case 1:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()
                this.stack[this.stack.length - 1].length = frame.value
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

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 4

            case 4:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()
                this.stack[this.stack.length - 1].object.key = frame.value
                this.step = 5

            case 5:

                this.stack.push({
                    value: 0,
                    bite: 1
                })
                this.step = 6

            case 6:

                frame = this.stack[this.stack.length - 1]

                while (frame.bite != -1) {
                    if (start == end) {
                        engine.start = start
                        return
                    }
                    frame.value += Math.pow(256, frame.bite) * buffer[start++]
                    frame.bite--
                }

                this.stack.pop()
                this.stack[this.stack.length - 1].object.value = frame.value
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

    return parsers
})()
