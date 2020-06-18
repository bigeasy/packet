module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    value: {
                        first: 0,
                        second: 0
                    }
                }

                $step = 1

            case 1:

                $step = 2

            case 2:

                if ($start == $end) {
                    return { start: $start, object: null, parse }
                }

                object.value.first = $buffer[$start++]


            case 3:

                $step = 4

            case 4:

                if ($start == $end) {
                    return { start: $start, object: null, parse }
                }

                object.value.second = $buffer[$start++]


            case 5:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
