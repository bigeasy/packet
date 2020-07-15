module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object, $step = 0) {
            let $_, $bite

            return function parse ($buffer, $start, $end) {
                switch ($step) {
                case 0:

                    object = {
                        value: 0,
                        sentry: 0
                    }

                    $step = 1

                case 1:

                    $step = 2

                case 2:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.value = $buffer[$start++]

                    ; (({ value = 0 }) => require('assert').equal(value, 1))({
                        value: object.value
                    })

                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.sentry = $buffer[$start++]


                case 5:

                    return { start: $start, object: object, parse: null }
                }
            }
        }
    } ()
}
