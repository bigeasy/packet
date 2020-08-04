module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $step = 1
                        $bite = 0
                        $_ =
                            (object.header.type << 6 & 0xc0)

                        switch (($ => $.header.type)(object)) {
                        case 0:

                            $_ |=
                                (object.header.value & 0x3f)

                            break

                        case 1:

                            $_ |=
                                (0xa << 2 & 0x3c) |
                                (object.header.value & 0x3)

                            break

                        default:

                            $_ |=
                                (object.header.value.two << 4 & 0x30) |
                                (object.header.value.four & 0xf)

                            break
                        }

                    case 1:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                    case 2:

                        $step = 3
                        $bite = 0
                        $_ = object.sentry

                    case 3:

                        while ($bite != -1) {
                            if ($start == $end) {
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }


                        $step = 4

                    case 4:

                        break

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
