module.exports = function ({ serializers }) {
    serializers.bff.object = function () {


        return function (object) {
            return function ($buffer, $start, $end) {
                let $_, $i = []

                if ($end - $start < 9) {
                    return serializers.inc.object(object, 0, $i)($buffer, $start, $end)
                }

                $_ = $start
                for ($i[0] = 0; $i[0] < object.array.length; $i[0]++) {
                    object.array[$i[0]].copy($buffer, $start)
                    $start += object.array[$i[0]].length
                    $_ += object.array[$i[0]].length
                }

                $_ = 8 - $_
                $buffer.fill(Buffer.from([ 0xd, 0xa ]), $start, $start + $_)
                $start += $_

                $buffer[$start++] = (object.sentry & 0xff)

                return { start: $start, serialize: null }
            }
        }
    } ()
}
