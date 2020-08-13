module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $_, $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.type & 0xff

                    if (($ => $.type == 0)(object)) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 3, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.value.value & 0xff
                    } else if (($ => $.type == 1)(object)) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 5, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.value.length & 0xff
                        $i[0] = 0

                        for (; $i[0] < object.value.length; $i[0]++) {
                            if ($end - $start < 1) {
                                return $incremental.object(object, 8, $i)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.value[$i[0]] & 0xff
                        }
                    } else if (($ => $.type == 2)(object)) {
                        for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                            if ($end - $start < 1) {
                                return $incremental.object(object, 11, $i)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.value[$i[0]] & 0xff
                        }

                        if ($end - $start < 1) {
                            return $incremental.object(object, 13, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = 0x0
                    } else if (($ => $.type == 3)(object)) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, 15, $i)($buffer, $start, $end)
                        }

                        $buffer[$start++] = object.value.length & 0xff

                        if ($end - $start < 0 + object.value.length) {
                            return $incremental.object(object, 17, $i)($buffer, $start, $end)
                        }

                        object.value.copy($buffer, $start, 0, object.value.length)
                        $start += object.value.length
                    } else if (($ => $.type == 4)(object)) {
                        if ($end - $start < 3) {
                            return $incremental.object(object, 18, $i)($buffer, $start, $end)
                        }

                        for ($i[0] = 0; $i[0] < object.value.length; $i[0]++) {
                            $buffer[$start++] = object.value[$i[0]] & 0xff
                        }
                    } else {
                        if ($end - $start < 3) {
                            return $incremental.object(object, 21, $i)($buffer, $start, $end)
                        }

                        $_ = 0
                        object.value.copy($buffer, $start)
                        $start += object.value.length
                        $_ += object.value.length
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 23, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
