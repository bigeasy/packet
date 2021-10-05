const sizeOf = {
    object: function () {
        return function (object) {
            let $start = 0, $accumulator = {}, $$ = []

            $$[0] = (value => Buffer.from(value, encoding))(object.string)

            $start += 1 * $$[0].length + 1

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            return function (object, $buffer, $start, {
                encoding = 'utf8'
            } = {}) {
                let $i = [], $$ = [], $accumulator = {}

                $accumulator['encoding'] = encoding

                $$[0] = (value => Buffer.from(value, encoding))(object.string)

                $$[0].copy($buffer, $start, 0, $$[0].length)
                $start += $$[0].length

                $buffer[$start++] = 0x0

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, {
                encoding = 'utf8'
            } = {}, $step = 0, $i = [], $$ = [], $accumulator = {}) {
                let $_

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $accumulator['encoding'] = encoding

                        case 1:

                            $$[0] = (value => Buffer.from(value, encoding))(object.string)

                        case 2:

                            $_ = 0

                        case 3: {

                                const length = Math.min($end - $start, $$[0].length - $_)
                                $$[0].copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != $$[0].length) {
                                    $step = 3
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

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
            return function ($buffer, $start, {
                encoding = 'utf8'
            } = {}) {
                let $_, $i = [], $accumulator = {}

                let object = {
                    string: null
                }

                $accumulator['encoding'] = encoding

                $_ = $buffer.indexOf(Buffer.from([ 0 ]), $start)
                $_ = ~$_ ? $_ : $start
                object.string = $buffer.slice($start, $_)
                $start = $_ + 1

                object.string = (value => value.toString(encoding))(object.string)

                return object
            }
        } ()
    },
    inc: {
        object: function () {
            return function (object, {
                encoding = 'utf8'
            } = {}, $step = 0, $i = [], $accumulator = []) {
                let $buffers = []

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                string: null
                            }

                        case 1:

                            $accumulator['encoding'] = encoding

                        case 2: {

                            const $index = $buffer.indexOf(0x0, $start)
                            if (~$index) {
                                $buffers.push($buffer.slice($start, $index))
                                $start = $index + 1
                                $step = 3
                                continue
                            } else {
                                $step = 2
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                        }

                        case 3:


                            object.string = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers.length = 0

                            object.string = (value => value.toString(encoding))(object.string)

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
                    return function (object, {
                        encoding = 'utf8'
                    } = {}) {
                        return function ($buffer, $start, $end) {
                            let $i = [], $$ = [], $accumulator = {}

                            $accumulator['encoding'] = encoding

                            $$[0] = (value => Buffer.from(value, encoding))(object.string)

                            if ($end - $start < 1 + $$[0].length * 1) {
                                return $incremental.object(object, {
                                    encoding: encoding
                                }, 2, $i, $$, $accumulator)($buffer, $start, $end)
                            }

                            $$[0].copy($buffer, $start, 0, $$[0].length)
                            $start += $$[0].length

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
                    return function ({
                        encoding = 'utf8'
                    } = {}) {
                        return function ($buffer, $start, $end) {
                            let $_, $i = [], $accumulator = {}

                            let object = {
                                string: null
                            }

                            $accumulator['encoding'] = encoding

                                                $_ = $buffer.indexOf(Buffer.from([ 0 ]), $start)
                                                if (~$_) {
                                                    object.string = $buffer.slice($start, $_)
                                                    $start = $_ + 1
                                                } else {
                                                    return $incremental.object(object, {
                                encoding: encoding
                            }, 2, $i, $accumulator)($buffer, $start, $end)
                                                }

                            object.string = (value => value.toString(encoding))(object.string)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
