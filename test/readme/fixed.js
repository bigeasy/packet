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
                let $i = []

                for ($i[0] = 0; $i[0] < object.fixed.length; $i[0]++) {
                    $buffer[$start++] = object.fixed[$i[0]] >>> 8 & 0xff
                    $buffer[$start++] = object.fixed[$i[0]] & 0xff
                }

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $i[0] = 0
                            $step = 1

                        case 1:

                            $bite = 1
                            $_ = object.fixed[$i[0]]

                        case 2:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.fixed.length) {
                                $step = 1
                                continue
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
                let $i = []

                let object = {
                    fixed: []
                }

                $i[0] = 0
                do {
                    object.fixed[$i[0]] =
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                } while (++$i[0] != 2)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                fixed: []
                            }

                        case 1:

                            $i[0] = 0

                        case 2:

                            $_ = 0
                            $bite = 1

                        case 3:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 3
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.fixed[$i[0]] = $_

                        case 4:

                            $i[0]++

                            if ($i[0] != 2) {
                                $step = 2
                                continue
                            }



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

                            if ($end - $start < 4) {
                                return $incremental.object(object, 0, $i)($buffer, $start, $end)
                            }

                            for ($i[0] = 0; $i[0] < object.fixed.length; $i[0]++) {
                                $buffer[$start++] = object.fixed[$i[0]] >>> 8 & 0xff
                                $buffer[$start++] = object.fixed[$i[0]] & 0xff
                            }

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
                                fixed: []
                            }

                            if ($end - $start < 4) {
                                return $incremental.object(object, 1, $i)($buffer, $start, $end)
                            }

                            $i[0] = 0
                            do {
                                object.fixed[$i[0]] =
                                    $buffer[$start++] << 8 |
                                    $buffer[$start++]
                            } while (++$i[0] != 2)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
