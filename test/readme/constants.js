const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 6

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start) {
                $buffer.write('fc', $start, $start + 1, 'hex')
                $start += 1


                $buffer[$start++] = object.key >>> 8 & 0xff
                $buffer[$start++] = object.key & 0xff

                $buffer.write('ab', $start, $start + 1, 'hex')
                $start += 1


                $buffer[$start++] = object.value >>> 8 & 0xff
                $buffer[$start++] = object.value & 0xff

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
                        $_ = [ 252 ]

                    case 1:

                        while ($bite != 1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }



                    case 2:

                        $bite = 1
                        $_ = object.key

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
                        $_ = [ 171 ]

                    case 5:

                        while ($bite != 1) {
                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_[$bite++]
                        }



                    case 6:

                        $bite = 1
                        $_ = object.value

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
                    key: 0,
                    value: 0
                }

                $start += 1


                object.key =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                $start += 1


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
                            key: 0,
                            value: 0
                        }

                    case 1:

                        $_ = 1

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

                        object.key = $_

                    case 5:

                        $_ = 1

                    case 6:

                        $bite = Math.min($end - $start, $_)
                        $_ -= $bite
                        $start += $bite

                        if ($_ != 0) {
                            $step = 6
                            return { start: $start, object: null, parse: $parse }
                        }



                    case 7:

                        $_ = 0
                        $bite = 1

                    case 8:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 8
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
                            if ($end - $start < 6) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $buffer.write('fc', $start, $start + 1, 'hex')
                            $start += 1


                            $buffer[$start++] = object.key >>> 8 & 0xff
                            $buffer[$start++] = object.key & 0xff

                            $buffer.write('ab', $start, $start + 1, 'hex')
                            $start += 1


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
                                key: 0,
                                value: 0
                            }

                            if ($end - $start < 6) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $start += 1


                            object.key =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            $start += 1


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
