module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const crypto = require('crypto')
            const assert = require('assert')

            return function ($buffer, $start, {
                hash = (() => crypto.createHash('md5'))()
            } = {}) {
                let $_, $i = [], $slice = null, $accumulator = {}, $starts = []

                let object = {
                    body: {
                        number: 0,
                        data: []
                    },
                    checksum: null
                }

                $accumulator['hash'] = hash

                $starts[0] = $start

                object.body.number = (
                    $buffer[$start++] << 24 |
                    $buffer[$start++] << 16 |
                    $buffer[$start++] << 8 |
                    $buffer[$start++]
                ) >>> 0

                $i[0] = 0
                for (;;) {
                    if (
                        $buffer[$start] == 0x0
                    ) {
                        $start += 1
                        break
                    }

                    object.body.data[$i[0]] = $buffer[$start++]

                    $i[0]++
                }

                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                    $buffer: $buffer,
                    $start: $starts[0],
                    $end: $start,
                    hash: $accumulator['hash']
                })

                $slice = $buffer.slice($start, $start + 16)
                $start += 16
                object.checksum = $slice

                ; (({ checksum = 0, hash }) => {
                    assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                })({
                    checksum: object.checksum,
                    hash: $accumulator['hash']
                })

                return object
            }
        } ()
    }
}
