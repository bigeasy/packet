const sizeOf = {
    object: function () {
        const assert = require('assert')

        return function (object) {
            let $start = 0

            $start += 3

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

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                $buffer[$start++] = object.length >>> 8 & 0xff
                $buffer[$start++] = object.length & 0xff

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

                $buffer[$start++] = object.type & 0xff

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

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                    case 1:

                        $bite = 1
                        $_ = object.length

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 3:

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

                    case 4:

                        $bite = 0
                        $_ = object.type

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 5
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
                    length: 0,
                    type: 0
                }

                object.length =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                object.type = $buffer[$start++]

                ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

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
                            length: 0,
                            type: 0
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

                        object.length = $_

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                    case 3:

                    case 4:

                        if ($start == $end) {
                            $step = 4
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.type = $buffer[$start++]

                        ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

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

                            if ($end - $start < 2 + 1) {
                                return $incremental.object(object, 0, $$)($buffer, $start, $end)
                            }

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                            $buffer[$start++] = object.length >>> 8 & 0xff
                            $buffer[$start++] = object.length & 0xff

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

                            $buffer[$start++] = object.type & 0xff

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
                                length: 0,
                                type: 0
                            }

                            if ($end - $start < 3) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.length =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.length)

                            object.type = $buffer[$start++]

                            ; ((max, $_ = 0) => assert($_ < max, `value excedes ${max}`))(object.type)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
