module.exports = function (parsers) {
    parsers.inc.object = function (object = {}, $step = 0, $i = []) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    object = {
                        value: []
                    }

                    $step = 1

                case 1:

                    $i[0] = 0

                case 2:


                case 3:

                    $step = 4

                case 4:

                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }

                    object.value[$i[0]] = $buffer[$start++]


                case 5:

                    $i[0]++

                    if ($i[0] == 4) {
                        $step = 6
                        continue
                    }

                    $step = 2
                    continue

                case 6:

                    $_ = (4 - $i[0]) * 1 - 0
                    $step = 7

                case 7:

                    $bite = Math.min($end - $start, $_)
                    $_ -= $bite
                    $start += $bite

                    if ($_ != 0) {
                        return { start: $start, object: null, parse }
                    }

                    $step = 8
                    object.value = (function (value) {
                        return Buffer.from(value).readFloatLE()
                    })(object.value)

                case 8:

                    return { start: $start, object: object, parse: null }
                }
                break
            }
        }
    }
}
