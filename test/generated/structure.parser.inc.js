module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
        return function (object, $step = 0) {
            let $_, $bite

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

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.value.first = $buffer[$start++]


                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse: $parse }
                    }

                    object.value.second = $buffer[$start++]


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
