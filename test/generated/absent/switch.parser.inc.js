module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function (object, $step = 0) {

                return function $parse ($buffer, $start, $end) {
                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                value: null
                            }

                        case 1:

                            switch (($ => 0)(object)) {
                            case 0:

                                $step = 2
                                continue

                            case undefined:

                                $step = 3
                                continue
                            }

                        case 2:

                            object.value = null
                            $step = 4
                            continue

                        case 3:

                            object.value = null

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
