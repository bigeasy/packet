module.exports = (function () {
    var parsers = {}

    parsers.object = function () {
        this.step = 0
        this.stack = [{
            object: this.object = {
                word: null
            },
            array: null,
            index: 0,
            length: 0
        }]
    }

    parsers.object.prototype.parse = function (engine) {
        var buffer = engine.buffer
        var start = engine.start
        var end = engine.end

        var frame = this.stack[this.stack.length - 1]

        switch (this.step) {
        case 0:

            this.stack.push({
                value: 0,
                bite: 0
            })
            this.step = 1

        case 1:

            frame = this.stack[this.stack.length - 1]

            while (frame.bite != 2) {
                if (start == end) {
                    engine.start = start
                    return
                }
                frame.value += Math.pow(256, frame.bite) * buffer[start++]
                frame.bite++
            }

            this.stack.pop()
            this.stack[this.stack.length - 1].object.word = frame.value
        case 2:

            engine.start = start

        }
    }

    return parsers
})()
