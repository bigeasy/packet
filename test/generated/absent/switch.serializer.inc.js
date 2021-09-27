module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {
                return function $serialize ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            switch (($ => 0)(object)) {
                            case 0:

                                $step = 1
                                continue

                            case undefined:

                                $step = 2
                                continue
                            }

                        case 1:
                            $step = 3
                            continue

                        case 2:

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
