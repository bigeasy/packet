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
                            $lookup[0].indexOf(object.header.type) << 4 & 0xf0

                        switch (($ => $.header.type)(object)) {
                        case 'publish':

                            $_ |=
                                object.header.flags.dup << 3 & 0x8 |
                                object.header.flags.qos << 1 & 0x6 |
                                object.header.flags.retain & 0x1

                            break
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

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
