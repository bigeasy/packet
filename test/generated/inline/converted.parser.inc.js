module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $i = []) {
                let $buffers = []

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                value: null,
                                sentry: 0
                            }

                        case 1: {

                            const $index = $buffer.indexOf(0x0, $start)
                            if (~$index) {
                                $buffers.push($buffer.slice($start, $index))
                                $start = $index + 1
                                $step = 2
                                continue
                            } else {
                                $step = 1
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                        }

                        case 2:


                            object.value = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers.length = 0

                            object.value = ((value) => parseInt(value.toString(), 10))(object.value)

                        case 3:

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.sentry = $buffer[$start++]

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
