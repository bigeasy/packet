module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function (object) {
                return function ($buffer, $start, $end) {
                    let $i = []

                    if ($end - $start < 1) {
                        return $incremental.object(object, 0, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.nudge & 0xff

                    if ($end - $start < 14) {
                        return $incremental.object(object, 2, $i)($buffer, $start, $end)
                    }

                    for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                        $buffer.write("0faded", $start, $start + 3, 'hex')
                        $start += 3
                    }

                    $buffer[$start++] = object.padded >>> 8 & 0xff
                    $buffer[$start++] = object.padded & 0xff

                    for ($i[0] = 0; $i[0] < 2; $i[0]++) {
                        $buffer.write("decafa", $start, $start + 3, 'hex')
                        $start += 3
                    }

                    if ($end - $start < 1) {
                        return $incremental.object(object, 12, $i)($buffer, $start, $end)
                    }

                    $buffer[$start++] = object.sentry & 0xff

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
