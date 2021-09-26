module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_, $i = []

                let object = {
                    value: null,
                    sentry: 0
                }

                $_ = $buffer.indexOf(Buffer.from([ 0 ]), $start)
                $_ = ~$_ ? $_ : $start
                object.value = $buffer.slice($start, $_)
                $start = $_ + 1

                object.value = ((value) => parseInt(value.toString(), 10))(object.value)

                object.sentry = $buffer[$start++]

                return object
            }
        } ()
    }
}
