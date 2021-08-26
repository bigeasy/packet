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
                let $$ = []

                $buffer[$start++] = object.mask >>> 8 & 0xff
                $buffer[$start++] = object.mask & 0xff

                $$[0] = (($_, $) => $_ ^ $.mask)(object.value, object)

                $buffer[$start++] = $$[0] >>> 8 & 0xff
                $buffer[$start++] = $$[0] & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 1
                        $_ = object.mask

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 2:

                        $$[0] = (($_, $) => $_ ^ $.mask)(object.value, object)

                    case 3:

                        $bite = 1
                        $_ = $$[0]

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 4
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
                let object = {
                    mask: 0,
                    value: 0
                }

                object.mask =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.value = (($_, $) => $_ ^ $.mask)(object.value, object)

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
                            mask: 0,
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

                        object.mask = $_

                    case 3:

                        $_ = 0
                        $bite = 1

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.value = $_

                        object.value = (($_, $) => $_ ^ $.mask)(object.value, object)

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

                            if ($end - $start < 2 + 2) {
                                return $incremental.object(object, 0, $$)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.mask >>> 8 & 0xff
                            $buffer[$start++] = object.mask & 0xff

                            $$[0] = (($_, $) => $_ ^ $.mask)(object.value, object)

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
                                mask: 0,
                                value: 0
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.mask =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            object.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            object.value = (($_, $) => $_ ^ $.mask)(object.value, object)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
