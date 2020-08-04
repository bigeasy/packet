module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            array: null,
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $step = 2

                    case 2:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]


                    case 3:

                        $_ = 0
                        $I[0] = (() => 8)()

                        $step = 4

                    case 4: {

                        const length = Math.min($end - $start, $I[0] - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != $I[0]) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.array = $buffers
                        $buffers = []

                        $step = 5

                    }

                    case 5:

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 7:

                        return { start: $start, object: object, parse: null }
                    }
                }
            }
        } ()
    }
}
