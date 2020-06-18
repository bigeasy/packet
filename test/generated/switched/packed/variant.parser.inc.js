module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.inc.object = function (object = {}, $step = 0) {
        let $_, $bite
        return function parse ($buffer, $start, $end) {
            switch ($step) {
            case 0:

                object = {
                    header: {
                        type: 0,
                        value: 0
                    }
                }

                $step = 1

            case 1:

                $_ = 0
                $step = 2
                $bite = 0

            case 2:

                while ($bite != -1) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += ($buffer[$start++]) << $bite * 8 >>> 0
                    $bite--
                }

                object.header.type = $_ >>> 6 & 0x3

                switch (($ => $.header.type)(object)) {
                case 0:
                    object.header.value = $_ & 0x3f

                    break

                case 1:
                    object.header.value = $_ & 0x3

                    break

                default:
                    object.header.value = {
                        two: 0,
                        four: 0
                    }

                    object.header.value.two = $_ >>> 4 & 0x3

                    object.header.value.four = $_ & 0xf

                    break
                }


            case 3:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
