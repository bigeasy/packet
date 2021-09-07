const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            switch ((($) => $.type)(object)) {
            case 1:

                $start += 1

                break

            case 2:

                $start += 2

                break

            case 3:

                $start += 2

                break

            default:

                $start += 4

                break
            }

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.type & 0xff

                switch ((($) => $.type)(object)) {
                case 1:

                    $buffer[$start++] = object.value & 0xff

                    break

                case 2:

                    $buffer[$start++] = object.value >>> 8 & 0xff
                    $buffer[$start++] = object.value & 0xff

                    break

                case 3:

                    $buffer[$start++] = object.value >>> 8 & 0xff
                    $buffer[$start++] = object.value & 0xff

                    break

                default:

                    $buffer[$start++] = object.value >>> 24 & 0xff
                    $buffer[$start++] = object.value >>> 16 & 0xff
                    $buffer[$start++] = object.value >>> 8 & 0xff
                    $buffer[$start++] = object.value & 0xff

                    break
                }

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $bite = 0
                            $_ = object.type

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

                            switch ((($) => $.type)(object)) {
                            case 1:

                                $step = 3
                                continue

                            case 2:

                                $step = 5
                                continue

                            case 3:

                                $step = 7
                                continue

                            default:

                                $step = 9
                                continue
                            }

                        case 3:

                            $bite = 0
                            $_ = object.value

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            $step = 11
                            continue

                        case 5:

                            $bite = 1
                            $_ = object.value

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            $step = 11
                            continue

                        case 7:

                            $bite = 1
                            $_ = object.value

                        case 8:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 8
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            $step = 11
                            continue

                        case 9:

                            $bite = 3
                            $_ = object.value

                        case 10:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 10
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
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
                let object = {
                    type: 0,
                    value: 0
                }

                object.type = $buffer[$start++]

                switch ((($) => $.type)(object)) {
                case 1:
                    object.value = $buffer[$start++]

                    break

                case 2:
                    object.value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    break

                case 3:
                    object.value =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]

                    break

                default:
                    object.value = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    break
                }

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                type: 0,
                                value: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.type = $buffer[$start++]

                        case 3:

                            switch ((($) => $.type)(object)) {
                            case 1:

                                $step = 4
                                continue

                            case 2:

                                $step = 6
                                continue

                            case 3:

                                $step = 8
                                continue

                            default:

                                $step = 10
                                continue
                            }

                        case 4:

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffer[$start++]
                            $step = 12
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

                            object.value = $_
                            $step = 12
                            continue

                        case 8:

                            $_ = 0
                            $bite = 1

                        case 9:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 9
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.value = $_
                            $step = 12
                            continue

                        case 10:

                            $_ = 0
                            $bite = 3

                        case 11:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 11
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.value = $_

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
                            if ($end - $start < 1) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.type & 0xff

                            switch ((($) => $.type)(object)) {
                            case 1:

                                if ($end - $start < 1) {
                                    return $incremental.object(object, 3)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value & 0xff

                                break

                            case 2:

                                if ($end - $start < 2) {
                                    return $incremental.object(object, 5)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 8 & 0xff
                                $buffer[$start++] = object.value & 0xff

                                break

                            case 3:

                                if ($end - $start < 2) {
                                    return $incremental.object(object, 7)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 8 & 0xff
                                $buffer[$start++] = object.value & 0xff

                                break

                            default:

                                if ($end - $start < 4) {
                                    return $incremental.object(object, 9)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 24 & 0xff
                                $buffer[$start++] = object.value >>> 16 & 0xff
                                $buffer[$start++] = object.value >>> 8 & 0xff
                                $buffer[$start++] = object.value & 0xff

                                break
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
                            let object = {
                                type: 0,
                                value: 0
                            }

                            if ($end - $start < 1) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.type = $buffer[$start++]

                            switch ((($) => $.type)(object)) {
                            case 1:
                                if ($end - $start < 1) {
                                    return $incremental.object(object, 4)($buffer, $start, $end)
                                }

                                object.value = $buffer[$start++]

                                break

                            case 2:
                                if ($end - $start < 2) {
                                    return $incremental.object(object, 6)($buffer, $start, $end)
                                }

                                object.value =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                break

                            case 3:
                                if ($end - $start < 2) {
                                    return $incremental.object(object, 8)($buffer, $start, $end)
                                }

                                object.value =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]

                                break

                            default:
                                if ($end - $start < 4) {
                                    return $incremental.object(object, 10)($buffer, $start, $end)
                                }

                                object.value = (
                                    $buffer[$start++] << 24 |
                                    $buffer[$start++] << 16 |
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]
                                ) >>> 0

                                break
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
