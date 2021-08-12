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
                    (object.header.type << 25 & 0xfe000000) >>> 0 |
                    object.header.encrypted << 24 & 0x1000000 |
                    object.header.volume << 14 & 0xffc000 |
                    object.header.length & 0x3fff

                $buffer[$start++] = $_ & 0xff
                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ >>> 16 & 0xff
                $buffer[$start++] = $_ >>> 24 & 0xff

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
                        $_ =
                            (object.header.type << 25 & 0xfe000000) >>> 0 |
                            object.header.encrypted << 24 & 0x1000000 |
                            object.header.volume << 14 & 0xffc000 |
                            object.header.length & 0x3fff

                    case 1:

                        while ($bite != 4) {
                            if ($start == $end) {
                                $step = 1
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
                let $_, $2s

                let object = {
                    header: {
                        type: 0,
                        encrypted: 0,
                        volume: 0,
                        length: 0
                    }
                }

                $_ = (
                    $buffer[$start++] |
                    $buffer[$start++] << 8 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 24
                ) >>> 0

                object.header.type = $_ >>> 25 & 0x7f

                object.header.encrypted = $_ >>> 24 & 0x1

                $2s = $_ >>> 14 & 0x3ff
                object.header.volume =
                    $2s & 0x200 ? (0x3ff - $2s + 1) * -1 : $2s

                object.header.length = $_ & 0x3fff

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $2s, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            header: {
                                type: 0,
                                encrypted: 0,
                                volume: 0,
                                length: 0
                            }
                        }

                    case 1:

                        $_ = 0
                        $bite = 0

                    case 2:

                        while ($bite != 4) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite++
                        }

                        object.header.type = $_ >>> 25 & 0x7f

                        object.header.encrypted = $_ >>> 24 & 0x1

                        $2s = $_ >>> 14 & 0x3ff
                        object.header.volume =
                            $2s & 0x200 ? (0x3ff - $2s + 1) * -1 : $2s

                        object.header.length = $_ & 0x3fff

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
                                (object.header.type << 25 & 0xfe000000) >>> 0 |
                                object.header.encrypted << 24 & 0x1000000 |
                                object.header.volume << 14 & 0xffc000 |
                                object.header.length & 0x3fff

                            $buffer[$start++] = $_ & 0xff
                            $buffer[$start++] = $_ >>> 8 & 0xff
                            $buffer[$start++] = $_ >>> 16 & 0xff
                            $buffer[$start++] = $_ >>> 24 & 0xff

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
                            let $_, $2s

                            let object = {
                                header: {
                                    type: 0,
                                    encrypted: 0,
                                    volume: 0,
                                    length: 0
                                }
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ = (
                                $buffer[$start++] |
                                $buffer[$start++] << 8 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 24
                            ) >>> 0

                            object.header.type = $_ >>> 25 & 0x7f

                            object.header.encrypted = $_ >>> 24 & 0x1

                            $2s = $_ >>> 14 & 0x3ff
                            object.header.volume =
                                $2s & 0x200 ? (0x3ff - $2s + 1) * -1 : $2s

                            object.header.length = $_ & 0x3fff

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
