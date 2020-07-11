module.exports = function ({ parsers }) {
    parsers.inc.object = function () {


        return function (object = {}, $step = 0, $i = []) {
            let $_, $bite, $buffers = []

            return function parse ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        object = {
                            array: null,
                            sentry: 0
                        }

                        $step = 1

                    case 1: {

                        const $index = $buffer.indexOf(0xd, $start)
                        if (~$index) {
                            $buffers.push($buffer.slice($start, $index))
                            $start = $index + 1
                            $step = 2
                            continue
                        } else {
                            $buffers.push($buffer.slice($start))
                            return { start: $end, parse }
                        }

                        $step = 2

                    }

                    case 2:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start++] != 0xa) {
                            $buffers.push(Buffer.from([ 13 ].concat($buffer[$start])))
                            $step = 2
                            continue
                        }

                        $step = 3

                    case 3:


                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                        $buffers.length = 0

                        $step = 4

                    case 4:

                        $step = 5

                    case 5:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 6:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
