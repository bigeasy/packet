module.exports = function (parsers) {
    function $alloc (value) {
        return Buffer.alloc(value)
    }

    function $from (value) {
        return Buffer.from(value)
    }

    parsers.bff.object = function () {
        return function parse ($buffer, $start, $end) {
            let $_

            const object = {
                value: 0
            }

            if ($end - $start < 4) {
                return parsers.inc.object(object, 1)($buffer, $start, $end)
            }

            $_ =
                ($buffer[$start++]) +
                ($buffer[$start++]) * 0x100 +
                ($buffer[$start++]) * 0x10000 +
                ($buffer[$start++]) * 0x1000000
            object.value = $_ & 0x80000000 ? (0xffffffff - $_ + 1) * -1 : $_

            return { start: $start, object: object, parse: null }
        }
    }
}
