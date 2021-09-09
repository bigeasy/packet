const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 4

            $start += 2

            $start += 1 * object.string.length

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                let $$ = []

                $buffer[$start++] = object.value >>> 24 & 0xff
                $buffer[$start++] = object.value >>> 16 & 0xff
                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff

                $$[0] = (($_) => Buffer.from($_, 'utf8'))(object.string)

                $buffer[$start++] = $$[0].length >>> 8 & 0xff
                $buffer[$start++] = $$[0].length & 0xff

                $$[0].copy($buffer, $start, 0, $$[0].length)
                $start += $$[0].length

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $$ = []) {
                let $_, $bite, $copied = 0

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 3
                            $_ = object.value

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

                            $$[0] = (($_) => Buffer.from($_, 'utf8'))(object.string)

                        case 3:

                            $bite = 1
                            $_ = $$[0].length

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 5: {

                            const $bytes = Math.min($end - $start, $$[0].length - $copied)
                            $$[0].copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != $$[0].length) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                            $copied = 0

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
                let $I = []

                let object = {
                    value: 0,
                    string: []
                }

                object.value = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.string = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

                object.string = (($_) => $_.toString('utf8'))(object.string)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $I = []) {
                let $_, $bite, $index = 0, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            value: 0,
                            string: []
                        }

                    case 1:

                        $_ = 0
                        $bite = 3

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.value = $_

                    case 3:

                        $_ = 0
                        $bite = 1

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        $I[0] = $_

                    case 5:

                        const $length = Math.min($I[0] - $index, $end - $start)
                        $buffers.push($buffer.slice($start, $start + $length))
                        $index += $length
                        $start += $length

                        if ($index != $I[0]) {
                            $step = 5
                            return { start: $start, parse: $parse }
                        }

                        object.string = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                        $index = 0
                        $buffers = []

                        object.string = (($_) => $_.toString('utf8'))(object.string)

                    }

                    return { start: $start, object: object, parse: null }
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
                            let $$ = []

                            if ($end - $start < 4) {
                                return $incremental.object(object, 0, $$)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.value >>> 24 & 0xff
                            $buffer[$start++] = object.value >>> 16 & 0xff
                            $buffer[$start++] = object.value >>> 8 & 0xff
                            $buffer[$start++] = object.value & 0xff

                            $$[0] = (($_) => Buffer.from($_, 'utf8'))(object.string)

                            if ($end - $start < 2 + object.string.length * 1) {
                                return $incremental.object(object, 3, $$)($buffer, $start, $end)
                            }

                            $buffer[$start++] = $$[0].length >>> 8 & 0xff
                            $buffer[$start++] = $$[0].length & 0xff

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length

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
                            let $I = []

                            let object = {
                                value: 0,
                                string: []
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1, $I)($buffer, $start, $end)
                            }

                            object.value = (
                                $buffer[$start++] << 24 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            ) >>> 0

                            if ($end - $start < 2) {
                                return $incremental.object(object, 3, $I)($buffer, $start, $end)
                            }

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            if ($end - $start < 1 * $I[0]) {
                                return $incremental.object(object, 5, $I)($buffer, $start, $end)
                            }

                            object.string = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            object.string = (($_) => $_.toString('utf8'))(object.string)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
