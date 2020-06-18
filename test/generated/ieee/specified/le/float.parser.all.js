module.exports = function (parsers) {
    const $Buffer = Buffer

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
            return $Buffer.from(value).readFloatLE()
        })(object.value)

        return object
    }
}
