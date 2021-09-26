module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const crypto = require('crypto')
            const assert = require('assert')

            return function (object, $buffer, $start, {
                hash = (() => crypto.createHash('md5'))()
            } = {}) {
                let $_, $i = [], $$ = [], $accumulator = {}, $starts = []

                $accumulator['hash'] = hash

                $starts[0] = $start

                $buffer[$start++] = object.body.number >>> 24 & 0xff
                $buffer[$start++] = object.body.number >>> 16 & 0xff
                $buffer[$start++] = object.body.number >>> 8 & 0xff
                $buffer[$start++] = object.body.number & 0xff

                for ($i[0] = 0; $i[0] < object.body.data.length; $i[0]++) {
                    $buffer[$start++] = object.body.data[$i[0]] & 0xff
                }

                $buffer[$start++] = 0x0

                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                    $buffer: $buffer,
                    $start: $starts[0],
                    $end: $start,
                    hash: $accumulator['hash']
                })

                $$[0] = (({ $_, hash }) => $_ = hash.digest())({
                    $_: object.checksum,
                    hash: $accumulator['hash']
                })

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                return { start: $start, serialize: null }
            }
        } ()
    }
}
