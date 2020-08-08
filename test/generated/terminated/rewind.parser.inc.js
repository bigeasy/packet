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

                            const $index = $buffer.indexOf(0x61, $start)
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

                            if ($buffer[$start++] != 0x62) {
                                if ($buffer[$start - 1] == 0x61) {
                                    $buffers.push(Buffer.from([ 0x61 ]))
                                    $step = 4
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0x61 ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 5:

                            if ($start == $end) {
                                $step = 5
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0x63) {
                                if ($buffer[$start - 1] == 0x61) {
                                    $buffers.push(Buffer.from([ 0x61, 0x62 ]))
                                    $step = 4
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0x61, 0x62 ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 6:

                            if ($start == $end) {
                                $step = 6
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0x61) {
                                $buffers.push(Buffer.from([ 0x61, 0x62, 0x63 ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0x62) {
                                $buffers.push(Buffer.from([ 0x61, 0x62, 0x63, 0x61 ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start++] != 0x64) {
                                if ($buffer[$start - 1] == 0x63) {
                                    $buffers.push(Buffer.from([ 0x61, 0x62, 0x63 ]))
                                    $step = 6
                                    continue
                                }
                                if ($buffer[$start - 1] == 0x61) {
                                    $buffers.push(Buffer.from([ 0x61, 0x62, 0x63, 0x61, 0x62 ]))
                                    $step = 4
                                    continue
                                }
                                $buffers.push(Buffer.from([ 0x61, 0x62, 0x63, 0x61, 0x62 ].concat($buffer[$start - 1])))
                                $step = 3
                                continue
                            }

                        case 9:


                            object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers.length = 0

                        case 10:

                        case 11:

                            if ($start == $end) {
                                $step = 11
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
