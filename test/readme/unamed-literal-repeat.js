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
                let $i = []

                for ($i[0] = 0; $i[0] < 3; $i[0]++) {
                    $buffer.write("beaf", $start, $start + 2, 'hex')
                    $start += 2
                }

                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 1
                        $_ = object.value

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
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
                    value: 0
                }

                $start += 6

                object.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

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
                            value: 0
                        }

                    case 1:

                        $_ = 6

                    case 2:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

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
                            let $i = []

                            if ($end - $start < 8) {
                                return $incremental.object(object, 0, $i)($buffer, $start, $end)
                            }

                            for ($i[0] = 0; $i[0] < 3; $i[0]++) {
                                $buffer.write("beaf", $start, $start + 2, 'hex')
                                $start += 2
                            }

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

                            if ($end - $start < 8) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $start += 6

                            object.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
