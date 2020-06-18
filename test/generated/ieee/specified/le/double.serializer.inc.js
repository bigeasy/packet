module.exports = function (serializers) {
    const $Buffer = Buffer

    serializers.inc.object = function (object, $step = 0, $i = []) {
        let $bite, $stop, $_

        const assert = require('assert')

        return function serialize ($buffer, $start, $end) {
            for (;;) {
                switch ($step) {
                case 0:

                    $i[0] = (function (value) {
                        const buffer = $Buffer.alloc(8)
                        buffer.writeDoubleLE(value)
                        return buffer
                    })(object.value)

                case 1:

                    $i[1] = 0
                    $step = 2
                    assert.equal($i[0].length, 8)

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


                    if ($i[1] != 8) {
                        $step = 4
                        continue
                    }

                    $step = 4

                case 4:

                    break

                }

                break
            }

            return { start: $start, serialize: null }
        }
    }
}
