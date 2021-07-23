module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        object = {
                            header: {
                                type: 0,
                                flags: null
                            }
                        }

                    case 1:

                        $_ = 0
                        $bite = 0

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        object.header.type = $lookup[0][$_ >>> 4 & 0xf]

                        switch (($ => $.header.type)(object)) {
                        case 'publish':
                            object.header.flags = {
                                dup: 0,
                                qos: 0,
                                retain: 0
                            }

                            object.header.flags.dup = $_ >>> 3 & 0x1

                            object.header.flags.qos = $_ >>> 1 & 0x3

                            object.header.flags.retain = $_ & 0x1

                            break
                        }

                    }

                    return { start: $start, object: object, parse: null }
                }
            }
        } ()
    }
}
