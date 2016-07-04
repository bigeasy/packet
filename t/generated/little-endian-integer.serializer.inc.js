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

        switch (this.step) {
        case 0:

            this.step = 1
            this.bite = 0

        case 1:

            while (this.bite != 4) {
                if (start == end) {
                    engine.start = start
                    return
                }
                buffer[start++] = frame.object.integer >>> this.bite * 8 & 0xff
                this.bite++
            }

            this.step = 2
        case 2:

            engine.start = start

        }

        engine.start = start

        return frame.object
    }

    return serializers
})()
