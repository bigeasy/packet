module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite, $index = 0, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                type: 0,
                                array: [],
                                sentry: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.type = $buffer[$start++]

                        case 3:

                            switch (($ => $.type)(object)) {
                            case 0:

                                $step = 4
                                continue

                            default:

                                $step = 6
                                continue
                            }

                        case 4:

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]
                            $step = 8
                            continue

                        case 6:

                            $_ = 0
                            $bite = 1

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            $I[0] = $_

                        case 8:

                            const $length = Math.min($I[0] - $index, $end - $start)
                            $buffers.push($buffer.slice($start, $start + $length))
                            $index += $length
                            $start += $length

                            if ($index != $I[0]) {
                                $step = 8
                                return { start: $start, parse: $parse }
                            }

                            object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                            $index = 0
                            $buffers = []

                        case 9:

                        case 10:

                            if ($start == $end) {
                                $step = 10
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
