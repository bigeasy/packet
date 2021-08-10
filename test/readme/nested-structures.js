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
                $buffer[$start++] = object.header.type & 0xff

                $buffer[$start++] = object.header.length >>> 8 & 0xff
                $buffer[$start++] = object.header.length & 0xff

                $buffer[$start++] = object.options.encrypted & 0xff

                $buffer[$start++] = object.options.checksum >>> 24 & 0xff
                $buffer[$start++] = object.options.checksum >>> 16 & 0xff
                $buffer[$start++] = object.options.checksum >>> 8 & 0xff
                $buffer[$start++] = object.options.checksum & 0xff

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

                        $bite = 0
                        $_ = object.header.type

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

                        $bite = 1
                        $_ = object.header.length

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 4:

                        $bite = 0
                        $_ = object.options.encrypted

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 6:

                        $bite = 3
                        $_ = object.options.checksum

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 7
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
                    header: {
                        type: 0,
                        length: 0
                    },
                    options: {
                        encrypted: 0,
                        checksum: 0
                    }
                }

                object.header.type = $buffer[$start++]

                object.header.length =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                object.options.encrypted = $buffer[$start++]

                object.options.checksum = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

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
                            header: {
                                type: 0,
                                length: 0
                            },
                            options: {
                                encrypted: 0,
                                checksum: 0
                            }
                        }

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.header.type = $buffer[$start++]

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

                        object.header.length = $_

                    case 5:

                    case 6:

                        if ($start == $end) {
                            $step = 6
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.options.encrypted = $buffer[$start++]

                    case 7:

                        $_ = 0
                        $bite = 3

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 8
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.options.checksum = $_

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
                            if ($end - $start < 3 + 5) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.header.type & 0xff

                            $buffer[$start++] = object.header.length >>> 8 & 0xff
                            $buffer[$start++] = object.header.length & 0xff

                            $buffer[$start++] = object.options.encrypted & 0xff

                            $buffer[$start++] = object.options.checksum >>> 24 & 0xff
                            $buffer[$start++] = object.options.checksum >>> 16 & 0xff
                            $buffer[$start++] = object.options.checksum >>> 8 & 0xff
                            $buffer[$start++] = object.options.checksum & 0xff

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
                                header: {
                                    type: 0,
                                    length: 0
                                },
                                options: {
                                    encrypted: 0,
                                    checksum: 0
                                }
                            }

                            if ($end - $start < 8) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            object.header.type = $buffer[$start++]

                            object.header.length =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            object.options.encrypted = $buffer[$start++]

                            object.options.checksum = (
                                $buffer[$start++] << 24 |
                                $buffer[$start++] << 16 |
                                $buffer[$start++] << 8 |
                                $buffer[$start++]
                            ) >>> 0

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
