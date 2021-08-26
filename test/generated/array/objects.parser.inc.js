module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                array: []
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            $I[0] = $buffer[$start++]

                        case 3:

                            $i[0] = 0

                        case 4:

                            object.array[$i[0]] = {
                                mask: 0,
                                value: 0
                            }

                        case 5:

                            $_ = 0
                            $bite = 1

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]].mask = $_

                        case 7:

                            $_ = 0
                            $bite = 1

                        case 8:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 8
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.array[$i[0]].value = $_

                            object.array[$i[0]].value = (($_, $, $i) => $_ ^ $.array[$i[0]].mask)(object.array[$i[0]].value, object, $i)
                            if (++$i[0] != $I[0]) {
                                $step = 4
                                continue
                            }

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
