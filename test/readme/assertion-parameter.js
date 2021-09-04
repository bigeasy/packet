const sizeOf = {
    object: function () {
        const assert = require('assert')

        return function (object) {
            let $start = 0

            $start += 2

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            const assert = require('assert')

            return function (object, $buffer, $start) {
                let $$ = []

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            const assert = require('assert')

            return function (object, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

                    case 1:

                        $bite = 1
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
            const assert = require('assert')

            return function ($buffer, $start) {
                let object = {
                    value: 0
                }

                object.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            const assert = require('assert')

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

                        object.value = $_

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

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

                            if ($end - $start < 2) {
                                return $incremental.object(object, 0, $$)($buffer, $start, $end)
                            }

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

                            $buffer[$start++] = object.value >>> 8 & 0xff
                            $buffer[$start++] = object.value & 0xff

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

                            if ($end - $start < 2) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.value)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
