const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 4

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = object.first & 0xff
                $buffer[$start++] = object.first >>> 8 & 0xff

                $buffer[$start++] = object.second & 0xff
                $buffer[$start++] = object.second >>> 8 & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ = object.first

                    case 1:

                        while ($bite != 2) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite++
                        }

                    case 2:

                        $bite = 0
                        $_ = object.second

                    case 3:

                        while ($bite != 2) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite++
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
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    first: 0,
                    second: 0
                }

                $_ =
                    $buffer[$start++] |
                    $buffer[$start++] << 8

                object.first = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                $_ =
                    $buffer[$start++] |
                    $buffer[$start++] << 8

                object.second = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            first: 0,
                            second: 0
                        }

                    case 1:

                        $_ = 0
                        $bite = 0

                    case 2:

                        while ($bite != 2) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite++
                        }

                        object.first = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                    case 3:

                        $_ = 0
                        $bite = 0

                    case 4:

                        while ($bite != 2) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite++
                        }

                        object.second = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

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
                            if ($end - $start < 4) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.first & 0xff
                            $buffer[$start++] = object.first >>> 8 & 0xff

                            $buffer[$start++] = object.second & 0xff
                            $buffer[$start++] = object.second >>> 8 & 0xff

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
                            let $_

                            let object = {
                                first: 0,
                                second: 0
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ =
                                $buffer[$start++] |
                                $buffer[$start++] << 8

                            object.first = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                            $_ =
                                $buffer[$start++] |
                                $buffer[$start++] << 8

                            object.second = $_ & 0x8000 ? (0xffff - $_ + 1) * -1 : $_

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
