const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 8

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer[$start++] = Number(object.value >> 56n & 0xffn)
                $buffer[$start++] = Number(object.value >> 48n & 0xffn)
                $buffer[$start++] = Number(object.value >> 40n & 0xffn)
                $buffer[$start++] = Number(object.value >> 32n & 0xffn)
                $buffer[$start++] = Number(object.value >> 24n & 0xffn)
                $buffer[$start++] = Number(object.value >> 16n & 0xffn)
                $buffer[$start++] = Number(object.value >> 8n & 0xffn)
                $buffer[$start++] = Number(object.value & 0xffn)

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

                        $bite = 7n
                        $_ = object.value

                    case 1:

                        while ($bite != -1n) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = Number($_ >> $bite * 8n & 0xffn)
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
                    value: 0n
                }

                $_ =
                    BigInt($buffer[$start++]) << 56n |
                    BigInt($buffer[$start++]) << 48n |
                    BigInt($buffer[$start++]) << 40n |
                    BigInt($buffer[$start++]) << 32n |
                    BigInt($buffer[$start++]) << 24n |
                    BigInt($buffer[$start++]) << 16n |
                    BigInt($buffer[$start++]) << 8n |
                    BigInt($buffer[$start++])

                object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

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
                            value: 0n
                        }

                    case 1:

                        $_ = 0n
                        $bite = 7n

                    case 2:

                        while ($bite != -1n) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += BigInt($buffer[$start++]) << $bite * 8n
                            $bite--
                        }

                        object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

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
                            if ($end - $start < 8) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = Number(object.value >> 56n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 48n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 40n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 32n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 24n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 16n & 0xffn)
                            $buffer[$start++] = Number(object.value >> 8n & 0xffn)
                            $buffer[$start++] = Number(object.value & 0xffn)

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
                                value: 0n
                            }

                            if ($end - $start < 8) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ =
                                BigInt($buffer[$start++]) << 56n |
                                BigInt($buffer[$start++]) << 48n |
                                BigInt($buffer[$start++]) << 40n |
                                BigInt($buffer[$start++]) << 32n |
                                BigInt($buffer[$start++]) << 24n |
                                BigInt($buffer[$start++]) << 16n |
                                BigInt($buffer[$start++]) << 8n |
                                BigInt($buffer[$start++])

                            object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
