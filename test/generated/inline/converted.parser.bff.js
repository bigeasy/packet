module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            return function () {
                return function ($buffer, $start, $end) {
                    let $_, $i = []

                    let object = {
                        value: null,
                        sentry: 0
                    }

                    $_ = $buffer.indexOf(Buffer.from([ 0 ]), $start)
                    if (~$_) {
                        object.value = $buffer.slice($start, $_)
                        $start = $_ + 1
                    } else {
                        return $incremental.object(object, 1, $i)($buffer, $start, $end)
                    }

                    object.value = ((value) => parseInt(value.toString(), 10))(object.value)

                    if ($end - $start < 1) {
                        return $incremental.object(object, 4, $i)($buffer, $start, $end)
                    }

                    object.sentry = $buffer[$start++]

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
