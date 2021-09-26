module.exports = function ({ $incremental, $lookup }) {
    return {
        object: function () {
            const crypto = require('crypto')
            const assert = require('assert')

            return function ({
                hash = (() => crypto.createHash('md5'))()
            } = {}) {
                return function ($buffer, $start, $end) {
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

                    if ($end - $start < 4) {
                        return $incremental.object(object, {
                            hash: hash
                        }, 3, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    object.body.number = (
                        $buffer[$start++] << 24 |
                        $buffer[$start++] << 16 |
                        $buffer[$start++] << 8 |
                        $buffer[$start++]
                    ) >>> 0

                    $i[0] = 0
                    for (;;) {
                        if ($end - $start < 1) {
                            return $incremental.object(object, {
                                hash: hash
                            }, 6, $i, $accumulator, $starts)($buffer, $start, $end)
                        }

                        if (
                            $buffer[$start] == 0x0
                        ) {
                            $start += 1
                            break
                        }

                        if ($end - $start < 1) {
                            return $incremental.object(object, {
                                hash: hash
                            }, 7, $i, $accumulator, $starts)($buffer, $start, $end)
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

                    if ($end - $start < 16) {
                        return $incremental.object(object, {
                            hash: hash
                        }, 11, $i, $accumulator, $starts)($buffer, $start, $end)
                    }

                    $slice = $buffer.slice($start, $start + 16)
                    $start += 16
                    object.checksum = $slice

                    ; (({ checksum = 0, hash }) => {
                        assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                    })({
                        checksum: object.checksum,
                        hash: $accumulator['hash']
                    })

                    return { start: $start, object: object, parse: null }
                }
            } ()
        }
    }
}
