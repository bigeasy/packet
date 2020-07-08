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

                    case 1:

                        $buffers = []

                    case 2:

                        $_ = $buffer.indexOf(13, $start)
                        if (~$_) {
                            $buffers.push($buffer.slice($start, $_))
                            $start = $_
                            $step = 3
                            continue
                        }


                    case 3:

                        if ($start == $end) {
                            return { start: $start, parse }
                        }

                        if ($buffer[$start++] != 10) {
                            $buffers.push(Buffer.from([ 13 ].concat($buffer[$start])))
                            $step = 2
                            continue
                        }

                        $step = 4

                    case 4:

                        object.array = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)

                        $step = 5

                    case 5:

                        $step = 6

                    case 6:

                        if ($start == $end) {
                            return { start: $start, object: null, parse }
                        }

                        object.sentry = $buffer[$start++]


                    case 7:

                        return { start: $start, object: object, parse: null }
                    }
                    break
                }
            }
        }
    } ()
}
