const sizeOf = {
    first: function () {
        return function (first) {
            let $start = 0

            $start += 2

            return $start
        }
    } (),
    second: function () {
        return function (second) {
            let $start = 0

            $start += 4

            return $start
        }
    } ()
}

const serializer = {
    all: {
        first: function () {
            return function (first, $buffer, $start) {
                $buffer[$start++] = first.value >>> 8 & 0xff
                $buffer[$start++] = first.value & 0xff

                return { start: $start, serialize: null }
            }
        } (),
        second: function () {
            return function (second, $buffer, $start) {
                $buffer[$start++] = second.value >>> 24 & 0xff
                $buffer[$start++] = second.value >>> 16 & 0xff
                $buffer[$start++] = second.value >>> 8 & 0xff
                $buffer[$start++] = second.value & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        first: function () {
            return function (first, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 1
                        $_ = first.value

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    }

                    return { start: $start, serialize: null }
                }
            }
        } (),
        second: function () {
            return function (second, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 3
                        $_ = second.value

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}

const parser = {
    all: {
        first: function () {
            return function ($buffer, $start) {
                let first = {
                    value: 0
                }

                first.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                return first
            }
        } (),
        second: function () {
            return function ($buffer, $start) {
                let $_

                let second = {
                    value: 0
                }

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                second.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

                return second
            }
        } ()
    },
    inc: {
        first: function () {
            return function (first, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        first = {
                            value: 0
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

                        first.value = $_

                    }

                    return { start: $start, object: first, parse: null }
                }
            }
        } (),
        second: function () {
            return function (second, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        second = {
                            value: 0
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

                        second.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

                    }

                    return { start: $start, object: second, parse: null }
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
                first: function () {
                    return function (first) {
                        return function ($buffer, $start, $end) {
                            if ($end - $start < 2) {
                                return $incremental.first(first, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = first.value >>> 8 & 0xff
                            $buffer[$start++] = first.value & 0xff

                            return { start: $start, serialize: null }
                        }
                    }
                } (),
                second: function () {
                    return function (second) {
                        return function ($buffer, $start, $end) {
                            if ($end - $start < 4) {
                                return $incremental.second(second, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = second.value >>> 24 & 0xff
                            $buffer[$start++] = second.value >>> 16 & 0xff
                            $buffer[$start++] = second.value >>> 8 & 0xff
                            $buffer[$start++] = second.value & 0xff

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
                first: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let first = {
                                value: 0
                            }

                            if ($end - $start < 2) {
                                return $incremental.first(first, 1)($buffer, $start, $end)
                            }

                            first.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            return { start: $start, object: first, parse: null }
                        }
                    } ()
                },
                second: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let $_

                            let second = {
                                value: 0
                            }

                            if ($end - $start < 4) {
                                return $incremental.second(second, 1)($buffer, $start, $end)
                            }

                            $_ = (
                                $buffer[$start++] << 24 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            ) >>> 0

                            second.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
