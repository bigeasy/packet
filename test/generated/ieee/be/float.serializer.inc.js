module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = [], $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            $$[0] = (function (value) {
                                const buffer = Buffer.alloc(4)
                                buffer.writeFloatBE(value)
                                return buffer
                            })(object.value)

                        case 1:

                            $_ = 0

                        case 2: {

                                const length = Math.min($end - $start, $$[0].length - $_)
                                $$[0].copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != $$[0].length) {
                                    $step = 2
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        case 3:

                            $bite = 0
                            $_ = object.sentry

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

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
