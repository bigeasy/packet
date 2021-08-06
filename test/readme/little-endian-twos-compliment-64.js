const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 16

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = Number(object.first & 0xffn)
                $buffer[$start++] = Number(object.first >> 8n & 0xffn)
                $buffer[$start++] = Number(object.first >> 16n & 0xffn)
                $buffer[$start++] = Number(object.first >> 24n & 0xffn)
                $buffer[$start++] = Number(object.first >> 32n & 0xffn)
                $buffer[$start++] = Number(object.first >> 40n & 0xffn)
                $buffer[$start++] = Number(object.first >> 48n & 0xffn)
                $buffer[$start++] = Number(object.first >> 56n & 0xffn)

                $buffer[$start++] = Number(object.second & 0xffn)
                $buffer[$start++] = Number(object.second >> 8n & 0xffn)
                $buffer[$start++] = Number(object.second >> 16n & 0xffn)
                $buffer[$start++] = Number(object.second >> 24n & 0xffn)
                $buffer[$start++] = Number(object.second >> 32n & 0xffn)
                $buffer[$start++] = Number(object.second >> 40n & 0xffn)
                $buffer[$start++] = Number(object.second >> 48n & 0xffn)
                $buffer[$start++] = Number(object.second >> 56n & 0xffn)

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

                        $bite = 0n
                        $_ = object.first

                    case 1:

                        while ($bite != 8n) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = Number($_ >> $bite * 8n & 0xffn)
                            $bite++
                        }

                    case 2:

                        $bite = 0n
                        $_ = object.second

                    case 3:

                        while ($bite != 8n) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = Number($_ >> $bite * 8n & 0xffn)
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
                    first: 0n,
                    second: 0n
                }

                $_ =
                    BigInt($buffer[$start++]) |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 56n

                object.first = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                $_ =
                    BigInt($buffer[$start++]) |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 56n

                object.second = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

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
                            first: 0n,
                            second: 0n
                        }

                    case 1:

                        $_ = 0n
                        $bite = 0n

                    case 2:

                        while ($bite != 8n) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += BigInt($buffer[$start++]) << $bite * 8n
                            $bite++
                        }

                        object.first = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                    case 3:

                        $_ = 0n
                        $bite = 0n

                    case 4:

                        while ($bite != 8n) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += BigInt($buffer[$start++]) << $bite * 8n
                            $bite++
                        }

                        object.second = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

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
                            if ($end - $start < 16) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = Number(object.first & 0xffn)
                            $buffer[$start++] = Number(object.first >> 8n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 16n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 24n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 32n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 40n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 48n & 0xffn)
                            $buffer[$start++] = Number(object.first >> 56n & 0xffn)

                            $buffer[$start++] = Number(object.second & 0xffn)
                            $buffer[$start++] = Number(object.second >> 8n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 16n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 24n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 32n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 40n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 48n & 0xffn)
                            $buffer[$start++] = Number(object.second >> 56n & 0xffn)

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
                                first: 0n,
                                second: 0n
                            }

                            if ($end - $start < 16) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ =
                                BigInt($buffer[$start++]) |
                                BigInt($buffer[$start++]) << 8n |
                                BigInt($buffer[$start++]) << 16n |
                                BigInt($buffer[$start++]) << 24n |
                                BigInt($buffer[$start++]) << 32n |
                                BigInt($buffer[$start++]) << 40n |
                                BigInt($buffer[$start++]) << 48n |
                                BigInt($buffer[$start++]) << 56n

                            object.first = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                            $_ =
                                BigInt($buffer[$start++]) |
                                BigInt($buffer[$start++]) << 8n |
                                BigInt($buffer[$start++]) << 16n |
                                BigInt($buffer[$start++]) << 24n |
                                BigInt($buffer[$start++]) << 32n |
                                BigInt($buffer[$start++]) << 40n |
                                BigInt($buffer[$start++]) << 48n |
                                BigInt($buffer[$start++]) << 56n

                            object.second = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
