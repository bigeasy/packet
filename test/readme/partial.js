const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0


            if ((value => value <= 0x7f)(object.value)) {
                $start += 1
            } else if ((value => value <= 0x3fff)(object.value)) {
                $start += 2
            } else if ((value => value <= 0x1fffff)(object.value)) {
                $start += 3
            } else {
                $start += 4
            }

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                if ((value => value <= 0x7f)(object.value)) {
                    $buffer[$start++] = object.value & 0xff
                } else if ((value => value <= 0x3fff)(object.value)) {
                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
                } else if ((value => value <= 0x1fffff)(object.value)) {
                    $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
                } else {
                    $buffer[$start++] = object.value >>> 21 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                    $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                    $buffer[$start++] = object.value & 0x7f
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

                            if ((value => value <= 0x7f)(object.value)) {
                                $step = 1
                                continue
                            } else if ((value => value <= 0x3fff)(object.value)) {
                                $step = 3
                                continue
                            } else if ((value => value <= 0x1fffff)(object.value)) {
                                $step = 6
                                continue
                            } else {
                                $step = 10
                                continue
                            }

                        case 1:

                            $bite = 0
                            $_ = object.value

                        case 2:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                            $step = 15
                            continue

                        case 3:

                            $_ = object.value

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 0 & 0x7f

                            $step = 15
                            continue

                        case 6:

                            $_ = object.value

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                        case 9:

                            if ($start == $end) {
                                $step = 9
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 0 & 0x7f

                            $step = 15
                            continue

                        case 10:

                            $_ = object.value

                        case 11:

                            if ($start == $end) {
                                $step = 11
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 21 & 0x7f | 0x80

                        case 12:

                            if ($start == $end) {
                                $step = 12
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 14 & 0x7f | 0x80

                        case 13:

                            if ($start == $end) {
                                $step = 13
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 7 & 0x7f | 0x80

                        case 14:

                            if ($start == $end) {
                                $step = 14
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = $_ >>> 0 & 0x7f

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
                let $sip = []

                let object = {
                    value: 0
                }

                $sip[0] = $buffer[$start++]

                if ((sip => (sip & 0x80) == 0)($sip[0], object)) {
                    $start -= 1

                    object.value = $buffer[$start++]
                } else {
                    $sip[1] = $buffer[$start++]

                    if ((sip => (sip & 0x80) == 0)($sip[1], object)) {
                        $start -= 2

                        object.value =
                            ($buffer[$start++] & 0x7f) << 7 |
                            $buffer[$start++]
                    } else {
                        $sip[2] = $buffer[$start++]

                        if ((sip => (sip & 0x80) == 0)($sip[2], object)) {
                            $start -= 3

                            object.value =
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                        } else {
                            $start -= 3

                            object.value = (
                                ($buffer[$start++] & 0x7f) << 21 |
                                ($buffer[$start++] & 0x7f) << 14 |
                                ($buffer[$start++] & 0x7f) << 7 |
                                $buffer[$start++]
                            ) >>> 0
                        }
                    }
                }

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $sip = []) {
                let $_

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                value: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[0] = $buffer[$start++]

                        case 3:

                            if ((sip => (sip & 0x80) == 0)($sip[0], object, object)) {
                                $step = 4
                                $parse(Buffer.from([
                                    $sip[0] & 0xff
                                ]), 0, 1)
                                continue
                            } else {
                                $step = 6
                                continue
                            }

                        case 4:

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.value = $buffer[$start++]

                            $step = 24
                            continue

                        case 6:

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[1] = $buffer[$start++]

                        case 8:

                            if ((sip => (sip & 0x80) == 0)($sip[1], object, object)) {
                                $step = 9
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff
                                ]), 0, 2)
                                continue
                            } else {
                                $step = 12
                                continue
                            }

                        case 9:

                            $_ = 0

                        case 10:

                            if ($start == $end) {
                                $step = 10
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 11:

                            if ($start == $end) {
                                $step = 11
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            object.value = $_

                            $step = 24
                            continue

                        case 12:

                        case 13:

                            if ($start == $end) {
                                $step = 13
                                return { start: $start, object: null, parse: $parse }
                            }

                            $sip[2] = $buffer[$start++]

                        case 14:

                            if ((sip => (sip & 0x80) == 0)($sip[2], object, object)) {
                                $step = 15
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff,
                                    $sip[2] & 0xff
                                ]), 0, 3)
                                continue
                            } else {
                                $step = 19
                                $parse(Buffer.from([
                                    $sip[0] & 0xff,
                                    $sip[1] & 0xff,
                                    $sip[2] & 0xff
                                ]), 0, 3)
                                continue
                            }

                        case 15:

                            $_ = 0

                        case 16:

                            if ($start == $end) {
                                $step = 16
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 14

                        case 17:

                            if ($start == $end) {
                                $step = 17
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 18:

                            if ($start == $end) {
                                $step = 18
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

                            object.value = $_

                            $step = 24
                            continue

                        case 19:

                            $_ = 0

                        case 20:

                            if ($start == $end) {
                                $step = 20
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 21

                        case 21:

                            if ($start == $end) {
                                $step = 21
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 14

                        case 22:

                            if ($start == $end) {
                                $step = 22
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] & 127 << 7

                        case 23:

                            if ($start == $end) {
                                $step = 23
                                return { start: $start, object: null, parse: $parse }
                            }

                            $_ += $buffer[$start++] << 0

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
                            if ((value => value <= 0x7f)(object.value)) {
                                if ($end - $start < 1) {
                                    return $incremental.object(object, 1)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value & 0xff
                            } else if ((value => value <= 0x3fff)(object.value)) {
                                if ($end - $start < 2) {
                                    return $incremental.object(object, 3)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = object.value & 0x7f
                            } else if ((value => value <= 0x1fffff)(object.value)) {
                                if ($end - $start < 3) {
                                    return $incremental.object(object, 6)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = object.value & 0x7f
                            } else {
                                if ($end - $start < 4) {
                                    return $incremental.object(object, 10)($buffer, $start, $end)
                                }

                                $buffer[$start++] = object.value >>> 21 & 0x7f | 0x80
                                $buffer[$start++] = object.value >>> 14 & 0x7f | 0x80
                                $buffer[$start++] = object.value >>> 7 & 0x7f | 0x80
                                $buffer[$start++] = object.value & 0x7f
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
                            let $sip = []

                            let object = {
                                value: 0
                            }

                            if ($end - $start < 1) {
                                return $incremental.object(object, 1, $sip)($buffer, $start, $end)
                            }

                            $sip[0] = $buffer[$start++]

                            if ((sip => (sip & 0x80) == 0)($sip[0], object)) {
                                if ($end - ($start - 1) < 1) {
                                    return $incremental.object(object, 4, $sip)($buffer, $start - 1, $end)
                                }

                                $start -= 1

                                object.value = $buffer[$start++]
                            } else {
                                if ($end - $start < 1) {
                                    return $incremental.object(object, 6, $sip)($buffer, $start, $end)
                                }

                                $sip[1] = $buffer[$start++]

                                if ((sip => (sip & 0x80) == 0)($sip[1], object)) {
                                    if ($end - ($start - 2) < 2) {
                                        return $incremental.object(object, 9, $sip)($buffer, $start - 2, $end)
                                    }

                                    $start -= 2

                                    object.value =
                                        ($buffer[$start++] & 0x7f) << 7 |
                                        $buffer[$start++]
                                } else {
                                    if ($end - $start < 1) {
                                        return $incremental.object(object, 12, $sip)($buffer, $start, $end)
                                    }

                                    $sip[2] = $buffer[$start++]

                                    if ((sip => (sip & 0x80) == 0)($sip[2], object)) {
                                        if ($end - ($start - 3) < 3) {
                                            return $incremental.object(object, 15, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        object.value =
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                    } else {
                                        if ($end - ($start - 3) < 4) {
                                            return $incremental.object(object, 19, $sip)($buffer, $start - 3, $end)
                                        }

                                        $start -= 3

                                        object.value = (
                                            ($buffer[$start++] & 0x7f) << 21 |
                                            ($buffer[$start++] & 0x7f) << 14 |
                                            ($buffer[$start++] & 0x7f) << 7 |
                                            $buffer[$start++]
                                        ) >>> 0
                                    }
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
