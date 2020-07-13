module.exports = function ({ serializers }) {
    serializers.inc.object = function () {


        return function (object, $step = 0, $i = []) {
            let $_, $bite, $copied = 0

            return function serialize ($buffer, $start, $end) {
                for (;;) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ = object.type

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 2:

                        $step = 3
                        $bite = 0
                        $_ = object.array.length

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }


                    case 4: {

                        const $bytes = Math.min($end - $start, object.array.length - $copied)
                        object.array.copy($buffer, $start, $copied, $copied + $bytes)
                        $copied += $bytes
                        $start += $bytes

                        if ($copied != object.array.length) {
                            return { start: $start, serialize }
                        }

                        $copied = 0

                        $step = 5

                    }

                    case 5:

                        if (($ => $.type == 0)(object)){
                            $step = 6
                            continue
                        } else if (($ => true)(object)){
                            $step = 8
                            continue
                        }

                    case 6:

                        $step = 7
                        $bite = 0
                        $_ = object.sentry

                    case 7:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 10
                        continue

                    case 8:

                        $step = 9
                        $bite = 1
                        $_ = object.sentry

                    case 9:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize }
                            }
                            $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                            $bite--
                        }

                        $step = 10

                    case 10:

                        break

                    }

                    break
                }

                return { start: $start, serialize: null }
            }
        }
    } ()
}
