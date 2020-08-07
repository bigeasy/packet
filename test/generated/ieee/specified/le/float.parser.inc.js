module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: null,
                            sentry: 0
                        }

                    case 1:

                        $_ = 0

                    case 2: {

                        const length = Math.min($end - $start, 4 - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != 4) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers = []

                    }

                        object.value = (function (value) {
                            return value.readFloatLE()
                        })(object.value)

                    case 3:

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }
                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
