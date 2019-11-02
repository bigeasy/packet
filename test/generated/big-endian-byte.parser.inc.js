module.exports = function (parse) {
    parse.inc.object = function (object = null, $step = 0, $i = []) {
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    word: 0
                }
                $step = 1

            case 1:

                $step = 2

            case 2:

                if ($start == $end) {
                    return { start: $start, object: null, parse }
                }

                object.word = $buffer[$start++]

                return {
                    start: $start,
                    object: object,
                    parse: null
                }

            }
        }
    }
}
