module.exports = function ({ serializers, $lookup }) {
    serializers.inc.object = function () {
        return function (object, $step = 0, $i = [], $$ = []) {
            let $_, $bite

            return function $serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $$[0] = (function (value) {
                            const buffer = Buffer.alloc(8)
                            buffer.writeDoubleLE(value)
                            return buffer
                        })(object.value)

                    case 1:

                        $_ = 0

                        $step = 2

                    case 2: {

                            const length = Math.min($end - $start, $$[0].length - $_)
                            $$[0].copy($buffer, $start, $_, $_ + length)
                            $start += length
                            $_ += length

                            if ($_ != $$[0].length) {
                                return { start: $start, serialize: $serialize }
                            }

                            $step = 3

                        }

                    case 3:

                        $step = 4
                        $bite = 0
                        $_ = object.sentry

                    case 4:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                        $step = 5

                    case 5:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
