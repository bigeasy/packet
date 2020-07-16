module.exports = function ({ parsers }) {
    parsers.inc.object = function () {
        return function (object, $step = 0, $i = []) {
            let $_, $bite, $buffers = []

            return function $parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            nudge: 0,
                            array: null,
                            sentry: 0
                        }

                        $step = 1

                    case 1:

                        $step = 2

                    case 2:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.nudge = $buffer[$start++]


                    // TODO Here we set the step upon entry, which is why we don't
                    // always have to set the step for an integer. Usually we have
                    // some sort of preamble that sets the step. We should eliminate
                    // steps where we can (why not?) and close the door behind us
                    // when we enter a step.
                    case 3: {

                        $step = 3

                        const $index = $buffer.indexOf(0xd, $start)
                        if (~$index) {
                            $buffers.push($buffer.slice($start, $index))
                            $start = $index + 1
                            $step = 4
                            continue
                        } else {
                            $buffers.push($buffer.slice($start))
                            return { start: $end, object: null, parse: $parse }
                        }

                        $step = 4

                    }

                    case 4:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        if ($buffer[$start++] != 0xa) {
                            $buffers.push(Buffer.from([ 13 ].concat($buffer[$start])))
                            $step = 4
                            continue
                        }

                        $step = 5

                    case 5:


                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers.length = 0

                        $step = 6

                    case 6:

                        $step = 7

                    case 7:

                        if ($start == $end) {
                            return { start: $start, object: null, parse: $parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 8:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
