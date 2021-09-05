const lookup = [ [ 'off', 'on' ] ]

const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0

            $start += 1

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function ($lookup) {
            return function (object, $buffer, $start) {
                let $_

                $_ =
                    $lookup[0].indexOf(object.header.type) & 0xff

                $buffer[$start++] = $_ & 0xff

                return { start: $start, serialize: null }
            }
        } (lookup)
    },
    inc: {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ =
                            $lookup[0].indexOf(object.header.type) & 0xff

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
        object: function ($lookup) {
            return function ($buffer, $start) {
                let $_

                let object = {
                    header: {
                        type: 0
                    }
                }

                $_ = $buffer[$start++]

                object.header.type = $lookup[0][$_ & 0xff]

                return object
            }
        } (lookup)
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
                                type: 0
                            }
                        }

                    case 1:

                        $_ = 0
                        $bite = 0

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.header.type = $lookup[0][$_ & 0xff]

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
                object: function ($lookup) {
                    return function (object) {
                        return function ($buffer, $start, $end) {
                            let $_

                            if ($end - $start < 1) {
                                return $incremental.object(object, 0)($buffer, $start, $end)
                            }

                            $_ =
                                $lookup[0].indexOf(object.header.type) & 0xff

                            $buffer[$start++] = $_ & 0xff

                            return { start: $start, serialize: null }
                        }
                    }
                } (lookup)
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
                            let $_

                            let object = {
                                header: {
                                    type: 0
                                }
                            }

                            if ($end - $start < 1) {
                                return $incremental.object(object, 1)($buffer, $start, $end)
                            }

                            $_ = $buffer[$start++]

                            object.header.type = $lookup[0][$_ & 0xff]

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
