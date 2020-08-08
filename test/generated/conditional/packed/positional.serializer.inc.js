module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $bite = 0
                        $_ =
                            (object.header.flag << 6 & 0xc0)

                        if (($ => $.header.flag == 0)(object)) {
                            $_ |=
                                (object.header.value & 0x3f)
                        } else if (($ => $.header.flag == 1)(object)) {
                            $_ |=
                                (0xa << 2 & 0x3c) |
                                (object.header.value & 0x3)
                        } else if (($ => $.header.flag == 2)(object)) {
                            $_ |=
                                (object.header.value.two << 4 & 0x30) |
                                (object.header.value.four & 0xf)
                        } else {
                            $_ |=
                                (object.header.value.one << 5 & 0x20) |
                                (object.header.value.five & 0x1f)
                        }

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

                        $bite = 0
                        $_ = object.sentry

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 3
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
