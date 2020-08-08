module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: {
                                first: 0,
                                second: 0
                            },
                            sentry: 0
                        }

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value.first = $buffer[$start++]

                    case 3:

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.value.second = $buffer[$start++]

                    case 5:

                    case 6:

                        if ($start == $end) {
                            $step = 6
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
