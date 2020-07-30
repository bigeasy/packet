module.exports = function ({ parsers, $lookup }) {
    parsers.bff.object = function () {
        return function () {
            return function ($buffer, $start, $end) {
                let object = {
                    value: 0
                }

                if ($end - $start < 8) {
                    return parsers.inc.object(object, 1)($buffer, $start, $end)
                }

                object.value =
                    BigInt($buffer[$start++]) +
                    (BigInt($buffer[$start++]) << 8n) +
                    (BigInt($buffer[$start++]) << 16n) +
                    (BigInt($buffer[$start++]) << 24n) +
                    (BigInt($buffer[$start++]) << 32n) +
                    (BigInt($buffer[$start++]) << 40n) +
                    (BigInt($buffer[$start++]) << 48n) +
                    (BigInt($buffer[$start++]) << 56n)

                return { start: $start, object: object, parse: null }
            }
        } ()
    }
}
