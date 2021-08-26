const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 2

            $start += 4 * object.array.length

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = [], $$ = []

                $buffer[$start++] = object.array.length >>> 8 & 0xff
                $buffer[$start++] = object.array.length & 0xff
                $i[0] = 0

                for (; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]].mask >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]].mask & 0xff

                    $$[0] = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                        value: object.array[$i[0]].value,
                        object: object,
                        $i: $i
                    })

                    $buffer[$start++] = $$[0] >>> 8 & 0xff
                    $buffer[$start++] = $$[0] & 0xff
                }

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = [], $$ = []) {
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
                            $_ = object.array[$i[0]].mask

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

                            $$[0] = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                                value: object.array[$i[0]].value,
                                object: object,
                                $i: $i
                            })

                        case 6:

                            $bite = 1
                            $_ = $$[0]

                        case 7:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 7
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
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
                    object.array[$i[0]] = {
                        mask: 0,
                        value: 0
                    }

                    object.array[$i[0]].mask =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    object.array[$i[0]].value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    object.array[$i[0]].value = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                        value: object.array[$i[0]].value,
                        object: object,
                        $i: $i
                    })
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

                            object.array[$i[0]].value = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                                value: object.array[$i[0]].value,
                                object: object,
                                $i: $i
                            })
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
                            let $i = [], $$ = []

                            if ($end - $start < 2 + object.array.length * 4) {
                                return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.array.length >>> 8 & 0xff
                            $buffer[$start++] = object.array.length & 0xff
                            $i[0] = 0

                            for (; $i[0] < object.array.length; $i[0]++) {
                                $buffer[$start++] = object.array[$i[0]].mask >>> 8 & 0xff
                                $buffer[$start++] = object.array[$i[0]].mask & 0xff

                                $$[0] = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                                    value: object.array[$i[0]].value,
                                    object: object,
                                    $i: $i
                                })

                                $buffer[$start++] = $$[0] >>> 8 & 0xff
                                $buffer[$start++] = $$[0] & 0xff
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

                            if ($end - $start < 4 * $I[0]) {
                                return $incremental.object(object, 3, $i, $I)($buffer, $start, $end)
                            }

                            for (; $i[0] < $I[0]; $i[0]++) {
                                object.array[$i[0]] = {
                                    mask: 0,
                                    value: 0
                                }

                                object.array[$i[0]].mask =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                object.array[$i[0]].value =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                object.array[$i[0]].value = (({ value, object, $i }) => value ^ object.array[$i[0]].mask)({
                                    value: object.array[$i[0]].value,
                                    object: object,
                                    $i: $i
                                })
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
