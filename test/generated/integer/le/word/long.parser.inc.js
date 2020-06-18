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
                    value: 0
                }

                $step = 1

            case 1:

                $_ = 0n
                $step = 2
                $bite = 0n

            case 2:

                while ($bite != 8n) {
                    if ($start == $end) {
                        return { start: $start, object: null, parse }
                    }
                    $_ += BigInt($buffer[$start++]) << $bite * 8n
                    $bite++
                }

                object.value = $_


            case 3:

                return { start: $start, object: object, parse: null }
            }
        }
    }
}
