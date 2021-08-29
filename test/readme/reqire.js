const sizeOf = {
    object: function () {
        const 0 = require('i')
        const 0 = require('i')

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
            const 0 = require('i')
            const 0 = require('i')

            return function (object, $buffer, $start) {
                let $$ = []

                $$[0] = ($value => ip.toLong($value))(object.value)

                $buffer[$start++] = $$[0] >>> 24 & 0xff
                $buffer[$start++] = $$[0] >>> 16 & 0xff
                $buffer[$start++] = $$[0] >>> 8 & 0xff
                $buffer[$start++] = $$[0] & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            const 0 = require('i')
            const 0 = require('i')

            return function (object, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $$[0] = ($value => ip.toLong($value))(object.value)

                    case 1:

                        $bite = 3
                        $_ = $$[0]

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
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
            const 0 = require('i')
            const 0 = require('i')

            return function ($buffer, $start) {
                let object = {
                    value: 0
                }

                object.value = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                object.value = ($value => ip.fromLong($value))(object.value)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            const 0 = require('i')
            const 0 = require('i')

            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
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

                        object.value = $_

                        object.value = ($value => ip.fromLong($value))(object.value)

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
                            let $$ = []

                            if ($end - $start < 4) {
                                return $incremental.object(object, 0, $$)($buffer, $start, $end)
                            }

                            $$[0] = ($value => ip.toLong($value))(object.value)

                            $buffer[$start++] = $$[0] >>> 24 & 0xff
                            $buffer[$start++] = $$[0] >>> 16 & 0xff
                            $buffer[$start++] = $$[0] >>> 8 & 0xff
                            $buffer[$start++] = $$[0] & 0xff

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
                                value: 0
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.value = (
                                $buffer[$start++] << 24 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            ) >>> 0

                            object.value = ($value => ip.fromLong($value))(object.value)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
