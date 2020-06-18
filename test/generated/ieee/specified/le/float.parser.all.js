module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.all.object = function ($buffer, $start) {
        let $i = []

        const object = {
            value: []
        }

        $i[0] = 0
        for (;;) {
            object.value[$i[0]] = ($buffer[$start++])
            $i[0]++

            if ($i[0] == 4) {
                break
            }
        }


        object.value = (function (value) {
            return $from(value).readFloatLE()
        })(object.value)

        return object
    }
}
