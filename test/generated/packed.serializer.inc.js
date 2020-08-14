module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ = object.nudge

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 1
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 2:

                        $bite = 3
                        $_ =
                            (0x5eaf << 17 & 0xfffe0000) >>> 0 |
                            object.header.one << 15 & 0x18000 |
                            object.header.two << 12 & 0x7000

                        $$[0] = (value => ~value & 0xf)(object.header.three)

                        $_ |=
                            $$[0] << 8 & 0xf00

                        $_ |=
                            $lookup[0].indexOf(object.header.four) << 6 & 0xc0 |
                            0xaa & 0x3f

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 3
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    case 4:

                        $bite = 0
                        $_ = object.sentry

                    case 5:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 5
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
