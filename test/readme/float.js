const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 12

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                let $_, $i = [], $$ = []

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(8)
                    buffer.writeDoubleBE(value)
                    return buffer
                })(object.doubled)

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                $$[0] = (function (value) {
                    const buffer = Buffer.alloc(4)
                    buffer.writeFloatBE(value)
                    return buffer
                })(object.float)

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = [], $$ = []) {
                let $_

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $$[0] = (function (value) {
                                const buffer = Buffer.alloc(8)
                                buffer.writeDoubleBE(value)
                                return buffer
                            })(object.doubled)

                        case 1:

                            $_ = 0

                        case 2: {

                                const length = Math.min($end - $start, $$[0].length - $_)
                                $$[0].copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != $$[0].length) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 3:

                            $$[0] = (function (value) {
                                const buffer = Buffer.alloc(4)
                                buffer.writeFloatBE(value)
                                return buffer
                            })(object.float)

                        case 4:

                            $_ = 0

                        case 5: {

                                const length = Math.min($end - $start, $$[0].length - $_)
                                $$[0].copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != $$[0].length) {
                                    $step = 5
                                    return { start: $start, serialize: $serialize }
                                }

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
                let $_, $i = [], $slice = null

                let object = {
                    doubled: null,
                    float: null
                }

                $slice = $buffer.slice($start, $start + 8)
                $start += 8
                object.doubled = $slice

                object.doubled = (function (value) {
                    return value.readDoubleBE()
                })(object.doubled)

                $slice = $buffer.slice($start, $start + 4)
                $start += 4
                object.float = $slice

                object.float = (function (value) {
                    return value.readFloatBE()
                })(object.float)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            doubled: null,
                            float: null
                        }

                    case 1:

                        $_ = 0

                    case 2: {

                        const length = Math.min($end - $start, 8 - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != 8) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.doubled = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers = []

                    }

                        object.doubled = (function (value) {
                            return value.readDoubleBE()
                        })(object.doubled)

                    case 3:

                        $_ = 0

                    case 4: {

                        const length = Math.min($end - $start, 4 - $_)
                        $buffers.push($buffer.slice($start, $start + length))
                        $start += length
                        $_ += length

                        if ($_ != 4) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.float = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers = []

                    }

                        object.float = (function (value) {
                            return value.readFloatBE()
                        })(object.float)

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
                            let $_, $i = [], $$ = []

                            if ($end - $start < 8 + 4) {
                                return $incremental.object(object, 0, $i, $$)($buffer, $start, $end)
                            }

                            $$[0] = (function (value) {
                                const buffer = Buffer.alloc(8)
                                buffer.writeDoubleBE(value)
                                return buffer
                            })(object.doubled)

                            $_ = 0
                            $$[0].copy($buffer, $start)
                            $start += $$[0].length
                            $_ += $$[0].length

                            $$[0] = (function (value) {
                                const buffer = Buffer.alloc(4)
                                buffer.writeFloatBE(value)
                                return buffer
                            })(object.float)

                            $_ = 0
                            $$[0].copy($buffer, $start)
                            $start += $$[0].length
                            $_ += $$[0].length

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
                            let $_, $i = [], $slice = null

                            let object = {
                                doubled: null,
                                float: null
                            }

                            if ($end - $start < 12) {
                                return $incremental.object(object, 1, $i)($buffer, $start, $end)
                            }

                            $slice = $buffer.slice($start, $start + 8)
                            $start += 8
                            object.doubled = $slice

                            object.doubled = (function (value) {
                                return value.readDoubleBE()
                            })(object.doubled)

                            $slice = $buffer.slice($start, $start + 4)
                            $start += 4
                            object.float = $slice

                            object.float = (function (value) {
                                return value.readFloatBE()
                            })(object.float)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
