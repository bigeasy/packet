const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0, $i = []

            $start += 2

            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                $start += 2

                $start += 1 * object.array[$i[0]].length
            }

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = []

                $buffer[$start++] = object.array.length >>> 8 & 0xff
                $buffer[$start++] = object.array.length & 0xff
                $i[0] = 0

                for (; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]].length >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]].length & 0xff
                    $i[1] = 0

                    for (; $i[1] < object.array[$i[0]].length; $i[1]++) {
                        $buffer[$start++] = object.array[$i[0]][$i[1]] & 0xff
                    }
                }

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 1
                            $_ = object.array.length

                        case 1:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 1
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 2:

                            $i[0] = 0

                        case 3:

                            $bite = 1
                            $_ = object.array[$i[0]].length

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 5:

                            $i[1] = 0

                        case 6:

                            $bite = 0
                            $_ = object.array[$i[0]][$i[1]]

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            if (++$i[1] != object.array[$i[0]].length) {
                                $step = 6
                                continue
                            }

                            if (++$i[0] != object.array.length) {
                                $step = 3
                                continue
                            }

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}

const parser = {
    all: {
        object: function () {
            return function ($buffer, $start) {
                let $i = [], $I = []

                let object = {
                    array: []
                }

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                $i[0] = 0

                for (; $i[0] < $I[0]; $i[0]++) {
                    object.array[$i[0]] = []

                    $I[1] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    $i[1] = 0

                    for (; $i[1] < $I[1]; $i[1]++) {
                        object.array[$i[0]][$i[1]] = $buffer[$start++]
                    }
                }

                return object
            }
        } ()
    },
    inc: {
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

                            $_ = 0
                            $bite = 1

                        case 2:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 2
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            $I[0] = $_

                        case 3:

                            $i[0] = 0

                        case 4:

                            object.array[$i[0]] = []

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

                            $I[1] = $_

                        case 7:

                            $i[1] = 0

                        case 8:

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]][$i[1]] = $buffer[$start++]
                            if (++$i[1] != $I[1]) {
                                $step = 8
                                continue
                            }
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

module.exports = {
    sizeOf: sizeOf,
    serializer: {
        all: serializer.all,
        inc: serializer.inc,
        bff: function ($incremental) {
            return {
                object: function () {
                    return function (object) {
                        return function ($buffer, $start, $end) {
                            let $i = []

                            if ($end - $start < 2) {
                                return $incremental.object(object, 0, $i)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.array.length >>> 8 & 0xff
                            $buffer[$start++] = object.array.length & 0xff
                            $i[0] = 0

                            for (; $i[0] < object.array.length; $i[0]++) {
                                if ($end - $start < 2 + object.array[$i[0]].length * 1) {
                                    return $incremental.object(object, 3, $i)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.array[$i[0]].length >>> 8 & 0xff
                                $buffer[$start++] = object.array[$i[0]].length & 0xff
                                $i[1] = 0

                                for (; $i[1] < object.array[$i[0]].length; $i[1]++) {
                                    $buffer[$start++] = object.array[$i[0]][$i[1]] & 0xff
                                }
                            }

                            return { start: $start, serialize: null }
                        }
                    }
                } ()
            }
        } (serializer.inc)
    },
    parser: {
        all: parser.all,
        inc: parser.inc,
        bff: function ($incremental) {
            return {
                object: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $i = [], $I = []

                            let object = {
                                array: []
                            }

                            if ($end - $start < 2) {
                                return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                            }

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            $i[0] = 0

                            for (; $i[0] < $I[0]; $i[0]++) {
                                object.array[$i[0]] = []

                                if ($end - $start < 2) {
                                    return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                                }

                                $I[1] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]
                                $i[1] = 0

                                if ($end - $start < 1 * $I[1]) {
                                    return $incremental.object(object, 7, $i, $I)($buffer, $start, $end)
                                }

                                for (; $i[1] < $I[1]; $i[1]++) {
                                    object.array[$i[0]][$i[1]] = $buffer[$start++]
                                }
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
