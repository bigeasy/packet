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

                $$[0] = ($_ => {
                    assert($_ < 1000, 'excedes max value')
                    return $_
                })(object.value)

                $buffer[$start++] = $$[0] >>> 8 & 0xff
                $buffer[$start++] = $$[0] & 0xff

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

                        $$[0] = ($_ => {
                            assert($_ < 1000, 'excedes max value')
                            return $_
                        })(object.value)

                    case 1:

                        $bite = 1
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
            const assert = require('assert')

            return function ($buffer, $start) {
                let object = {
                    value: 0
                }

                object.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.value = ($_ => {
                    assert($_ < 1000, 'execdes max value')
                    return $_
                })(object.value)

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

                        object.value = ($_ => {
                            assert($_ < 1000, 'execdes max value')
                            return $_
                        })(object.value)

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

                            $$[0] = ($_ => {
                                assert($_ < 1000, 'excedes max value')
                                return $_
                            })(object.value)

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

                            if ($end - $start < 2) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            object.value = ($_ => {
                                assert($_ < 1000, 'execdes max value')
                                return $_
                            })(object.value)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
