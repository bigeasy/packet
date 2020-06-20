module.exports = function (serializers) {
    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        const assert = require('assert')

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $i[0] = (function (value) {
                        const buffer = Buffer.alloc(4)
                        buffer.writeFloatBE(value)
                        return buffer
                    })(object.value)

                case 1:

                    $i[1] = 0
                    $step = 2
                    assert.equal($i[0].length, 4)

                case 2:

                    $step = 3
                    $bite = 0
                    $_ = $i[0][$i[1]]

                case 3:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }

                    if (++$i[1] != $i[0].length) {
                        $step = 2
                        continue
                    }

                    $step = 4


                    if ($i[1] != 4) {
                        $step = 4
                        continue
                    }

                case 4:

                    $step = 5
                    $bite = 0
                    $_ = object.sentry

                case 5:

                    while ($bite != -1) {
                        if ($start == $end) {
                            return { start: $start, serialize }
                        }
                        $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                        $bite--
                    }


                    $step = 6

                case 6:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
