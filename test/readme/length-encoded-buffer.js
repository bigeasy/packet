const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 2

            $start += 1 * object.array.length

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.array.length >>> 8 & 0xff
                $buffer[$start++] = object.array.length & 0xff

                object.array.copy($buffer, $start, 0, object.array.length)
                $start += object.array.length

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite, $copied = 0

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

                        case 2: {

                            const $bytes = Math.min($end - $start, object.array.length - $copied)
                            object.array.copy($buffer, $start, $copied, $copied + $bytes)
                            $copied += $bytes
                            $start += $bytes

                            if ($copied != object.array.length) {
                                $step = 2
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
                    array: []
                }

                $I[0] =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.array = $buffer.slice($start, $start + $I[0])
                $start += $I[0]

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
                        {
                            const $length = Math.min($I[0] - $index, $end - $start)
                            $buffers.push($buffer.slice($start, $start + $length))
                            $index += $length
                            $start += $length
                        }

                        if ($index != $I[0]) {
                            $step = 3
                            return { start: $start, parse: $parse }
                        }

                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                        $index = 0
                        $buffers = []

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
                            if ($end - $start < 2 + object.array.length * 1) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.array.length >>> 8 & 0xff
                            $buffer[$start++] = object.array.length & 0xff

                            object.array.copy($buffer, $start, 0, object.array.length)
                            $start += object.array.length

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
                                array: []
                            }

                            if ($end - $start < 2) {
                                return $incremental.object(object, 1, $I)($buffer, $start, $end)
                            }

                            $I[0] =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            if ($end - $start < 1 * $I[0]) {
                                return $incremental.object(object, 3, $I)($buffer, $start, $end)
                            }

                            object.array = $buffer.slice($start, $start + $I[0])
                            $start += $I[0]

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
