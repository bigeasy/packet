module.exports = function (serializers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    serializers.inc.object = function (object, $step = 0) {
        let $bite, $stop, $_

        return function serialize ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                $step = 1
                $bite = 0
                $_ = object.word

            case 1:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, serialize }
                    }
                    $buffer[$start++] = ($_ >>> $bite * 8 & 0xff)
                    $bite--
                }


                $step = 2

            case 2:

                break

            }

            return { start: $start, serialize: null }
        }
    }
}
