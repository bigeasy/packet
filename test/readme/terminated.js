const sizeOf = {
    object: function () {
        const assert = require('assert')

        return function (object) {
            let $start = 0

            $start += 1 * object.array.length + 1

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            const assert = require('assert')

            return function (object, $buffer, $start) {
                let $i = []

                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    $buffer[$start++] = object.array[$i[0]] & 0xff
                }

                $buffer[$start++] = 0x0

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            const assert = require('assert')

            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $i[0] = 0
                            $step = 1

                        case 1:

                            $bite = 0
                            $_ = object.array[$i[0]]

                        case 2:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.array.length) {
                                $step = 1
                                continue
                            }

                            $step = 3

                        case 3:

                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                        case 4:

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
            const assert = require('assert')

            return function ($buffer, $start) {
                let $i = []

                let object = {
                    array: []
                }

                $i[0] = 0
                for (;;) {
                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.array[$i[0]] = $buffer[$start++]

                    $i[0]++
                }

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            const assert = require('assert')

            return function (object, $step = 0, $i = []) {
                let $length = 0

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                array: []
                            }

                        case 1:

                            $i[0] = 0

                        case 2:

                            $step = 2

                            if ($start == $end) {
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] == 0x0) {
                                $start++
                                $step = 6
                                continue
                            }

                            $step = 3

                        case 3:

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.array[$i[0]] = $buffer[$start++]

                        case 5:

                            $i[0]++
                            $step = 2
                            continue

                        case 6:

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
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
                            let $i = []

                            if ($end - $start < 1 + object.array.length * 1) {
                                return $incremental.object(object, 0, $i)($buffer, $start, $end)
                            }

                            for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                                $buffer[$start++] = object.array[$i[0]] & 0xff
                            }

                            $buffer[$start++] = 0x0

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
                            let $i = []

                            let object = {
                                array: []
                            }

                            $i[0] = 0
                            for (;;) {
                                if ($end - $start < 1) {
                                    return $incremental.object(object, 2, $i)($buffer, $start, $end)
                                }

                                if (
                                    $buffer[$start] == 0x0
                                ) {
                                    $start += 1
                                    break
                                }

                                if ($end - $start < 1) {
                                    return $incremental.object(object, 3, $i)($buffer, $start, $end)
                                }

                                object.array[$i[0]] = $buffer[$start++]

                                $i[0]++
                            }

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
