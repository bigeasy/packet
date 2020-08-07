module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            value: 0n,
                            sentry: 0
                        }

                    case 1:

                    case 2:

                        if ($start == $end) {
                            $step = 2
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]

                    case 3:

                        $_ = 0n
                        $bite = 0n

                    case 4:

                        while ($bite != 8n) {
                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += BigInt($buffer[$start++]) << $bite * 8n
                            $bite++
                        }

                        object.value = $_ & 0x8000000000000000n ? (0xffffffffffffffffn - $_ + 1n) * -1n : $_

                    case 5:

                    case 6:

                        if ($start == $end) {
                            $step = 6
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]

                    }
                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
