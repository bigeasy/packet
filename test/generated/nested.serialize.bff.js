module.exports = function (serializers) {
    serializers.bff.object = function (object) {
        return function ($buffer, $start, $end) {
            let $_

            if ($end - $start < 2) {
                return {
                    start: $start,
                    serialize: serializers.inc.object(object, 0, [])
                }
            }

            let $array = object.values

            $buffer[$start++] = $array.length >>> 8 & 0xff
            $buffer[$start++] = $array.length & 0xff

            for (let $i = 0; $i < $array.length; $i++) {
                let $element = $array[$i]

                if ($end - $start < 4) {
                    return {
                        start: $start,
                        serialize: serializers.inc.object(object, 2, [ $i ])
                    }
                }

                $_ = $element.key

                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ & 0xff

                $_ = $element.value

                $buffer[$start++] = $_ >>> 8 & 0xff
                $buffer[$start++] = $_ & 0xff
            }

            return { start: $start, serialize: null }
        }
    }
}
