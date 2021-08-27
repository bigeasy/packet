const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 3

            $start += ($ => $.header.length)(object) * 2

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                let $i = [], $I = []

                $buffer[$start++] = object.header.length >>> 8 & 0xff
                $buffer[$start++] = object.header.length & 0xff

                $buffer[$start++] = object.header.type & 0xff

                $I[0] = ($ => $.header.length)(object)

                for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]] >>> 8 & 0xff
                    $buffer[$start++] = object.array[$i[0]] & 0xff
                }

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = [], $I = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 1
                            $_ = object.header.length

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

                            $bite = 0
                            $_ = object.header.type

                        case 3:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 3
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 4:

                            $i[0] = 0
                            $I[0] = ($ => $.header.length)(object)

                            $step = 5

                        case 5:

                            $bite = 1
                            $_ = object.array[$i[0]]

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.array.length) {
                                $step = 5
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
                    header: {
                        length: 0,
                        type: 0
                    },
                    array: []
                }

                object.header.length =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.header.type = $buffer[$start++]

                $I[0] = ($ => $.header.length)(object)

                $i[0] = 0
                do {
                    object.array[$i[0]] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                } while (++$i[0] != $I[0])

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
                                header: {
                                    length: 0,
                                    type: 0
                                },
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

                            object.header.length = $_

                        case 3:

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.header.type = $buffer[$start++]

                        case 5:

                            $i[0] = 0
                            $I[0] = ($ => $.header.length)(object)

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

                            object.array[$i[0]] = $_

                        case 8:

                            $i[0]++

                            if ($i[0] != $I[0]) {
                                $step = 6
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
                            let $i = [], $I = []

                            if ($end - $start < 3) {
                                return $incremental.object(object, 0, $i, $I)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.header.length >>> 8 & 0xff
                            $buffer[$start++] = object.header.length & 0xff

                            $buffer[$start++] = object.header.type & 0xff

                            $I[0] = ($ => $.header.length)(object)

                            if ($end - $start < $I[0] * 2) {
                                return $incremental.object(object, 4, $i, $I)($buffer, $start, $end)
                            }

                            for ($i[0] = 0; $i[0] < $I[0]; $i[0]++) {
                                if ($end - $start < 2) {
                                    return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.array[$i[0]] >>> 8 & 0xff
                                $buffer[$start++] = object.array[$i[0]] & 0xff
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
                                header: {
                                    length: 0,
                                    type: 0
                                },
                                array: []
                            }

                            if ($end - $start < 3) {
                                return $incremental.object(object, 1, $i, $I)($buffer, $start, $end)
                            }

                            object.header.length =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            object.header.type = $buffer[$start++]

                            $I[0] = ($ => $.header.length)(object)

                            if ($end - $start < $I[0] * 2) {
                                return $incremental.object(object, 5, $i, $I)($buffer, $start, $end)
                            }

                            $i[0] = 0
                            do {
                                if ($end - $start < 2) {
                                    return $incremental.object(object, 7, $i, $I)($buffer, $start, $end)
                                }

                                object.array[$i[0]] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]
                            } while (++$i[0] != $I[0])

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
