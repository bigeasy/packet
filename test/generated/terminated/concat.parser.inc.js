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
                                nudge: 0,
                                array: null,
                                sentry: 0
                            }

                        case 1:

                        case 2:

                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.nudge = $buffer[$start++]

                        case 3: {

                            const $index = $buffer.indexOf(0xd, $start)
                            if (~$index) {
                                $buffers.push($buffer.slice($start, $index))
                                $start = $index + 1
                                $step = 4
                                continue
                            } else {
                                $step = 3
                                $buffers.push($buffer.slice($start))
                                return { start: $end, object: null, parse: $parse }
                            }

                        }

                        case 4:

                            if ($start == $end) {
                                $step = 4
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0xa) {
                                if ($buffer[$start - 1] == 0xd) {
                                    $buffers.push(Buffer.from([ 0xd ]))
                                    $step = 4
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0xd ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 5:


                            object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers.length = 0

                        case 6:

                        case 7:

                            if ($start == $end) {
                                $step = 7
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
