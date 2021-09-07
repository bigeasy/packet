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
                let $_

                $_ =
                    (object.header.type << 28 & 0xf0000000) >>> 0

                if (($ => $.header.type == 1)(object)) {
                    $_ |=
                        object.header.value & 0xfffffff
                } else if (($ => $.header.type == 2)(object)) {
                    $_ |=
                        object.header.value.first << 24 & 0xf000000 |
                        object.header.value.second & 0xffffff
                } else if (($ => $.header.type == 3)(object)) {
                    $_ |=
                        object.header.value.first << 14 & 0xfffc000 |
                        object.header.value.second & 0x3fff
                } else {
                    $_ |=
                        0xffffff << 4 & 0xffffff0 |
                        object.header.value & 0xf
                }

                $buffer[$start++] = $_ >>> 24 & 0xff
                $buffer[$start++] = $_ >>> 16 & 0xff
                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ & 0xff

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

                        $bite = 3
                        $_ =
                            (object.header.type << 28 & 0xf0000000) >>> 0

                        if (($ => $.header.type == 1)(object)) {
                            $_ |=
                                object.header.value & 0xfffffff
                        } else if (($ => $.header.type == 2)(object)) {
                            $_ |=
                                object.header.value.first << 24 & 0xf000000 |
                                object.header.value.second & 0xffffff
                        } else if (($ => $.header.type == 3)(object)) {
                            $_ |=
                                object.header.value.first << 14 & 0xfffc000 |
                                object.header.value.second & 0x3fff
                        } else {
                            $_ |=
                                0xffffff << 4 & 0xffffff0 |
                                object.header.value & 0xf
                        }

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
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    header: {
                        type: 0,
                        value: null
                    }
                }

                $_ = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.header.type = $_ >>> 28 & 0xf

                if (($ => $.header.type == 1)(object)) {
                    object.header.value = $_ & 0xfffffff
                } else if (($ => $.header.type == 2)(object)) {
                    object.header.value = {
                        first: 0,
                        second: 0
                    }

                    object.header.value.first = $_ >>> 24 & 0xf

                    object.header.value.second = $_ & 0xffffff
                } else if (($ => $.header.type == 3)(object)) {
                    object.header.value = {
                        first: 0,
                        second: 0
                    }

                    object.header.value.first = $_ >>> 14 & 0x3fff

                    object.header.value.second = $_ & 0x3fff
                } else {
                    object.header.value = $_ & 0xf
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
                    switch ($step) {
                    case 0:

                        object = {
                            header: {
                                type: 0,
                                value: null
                            }
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

                        object.header.type = $_ >>> 28 & 0xf

                        if (($ => $.header.type == 1)(object)) {
                            object.header.value = $_ & 0xfffffff
                        } else if (($ => $.header.type == 2)(object)) {
                            object.header.value = {
                                first: 0,
                                second: 0
                            }

                            object.header.value.first = $_ >>> 24 & 0xf

                            object.header.value.second = $_ & 0xffffff
                        } else if (($ => $.header.type == 3)(object)) {
                            object.header.value = {
                                first: 0,
                                second: 0
                            }

                            object.header.value.first = $_ >>> 14 & 0x3fff

                            object.header.value.second = $_ & 0x3fff
                        } else {
                            object.header.value = $_ & 0xf
                        }

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
                            let $_

                            if ($end - $start < 4) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $_ =
                                (object.header.type << 28 & 0xf0000000) >>> 0

                            if (($ => $.header.type == 1)(object)) {
                                $_ |=
                                    object.header.value & 0xfffffff
                            } else if (($ => $.header.type == 2)(object)) {
                                $_ |=
                                    object.header.value.first << 24 & 0xf000000 |
                                    object.header.value.second & 0xffffff
                            } else if (($ => $.header.type == 3)(object)) {
                                $_ |=
                                    object.header.value.first << 14 & 0xfffc000 |
                                    object.header.value.second & 0x3fff
                            } else {
                                $_ |=
                                    0xffffff << 4 & 0xffffff0 |
                                    object.header.value & 0xf
                            }

                            $buffer[$start++] = $_ >>> 24 & 0xff
                            $buffer[$start++] = $_ >>> 16 & 0xff
                            $buffer[$start++] = $_ >>> 8 & 0xff
                            $buffer[$start++] = $_ & 0xff

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
                                header: {
                                    type: 0,
                                    value: null
                                }
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ = (
                                $buffer[$start++] << 24 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            ) >>> 0

                            object.header.type = $_ >>> 28 & 0xf

                            if (($ => $.header.type == 1)(object)) {
                                object.header.value = $_ & 0xfffffff
                            } else if (($ => $.header.type == 2)(object)) {
                                object.header.value = {
                                    first: 0,
                                    second: 0
                                }

                                object.header.value.first = $_ >>> 24 & 0xf

                                object.header.value.second = $_ & 0xffffff
                            } else if (($ => $.header.type == 3)(object)) {
                                object.header.value = {
                                    first: 0,
                                    second: 0
                                }

                                object.header.value.first = $_ >>> 14 & 0x3fff

                                object.header.value.second = $_ & 0x3fff
                            } else {
                                object.header.value = $_ & 0xf
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
