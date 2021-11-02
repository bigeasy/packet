module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const crypto = require('crypto')
            const assert = require('assert')

            return function (object, {
                hash = (() => crypto.createHash('md5'))()
            } = {}, $step = 0, $i = [], $accumulator = [], $starts = []) {
                let $_, $bite, $restart = false, $length = 0, $buffers = []

                return function $parse ($buffer, $start, $end) {
                    if ($restart) {
                        for (let $j = 0; $j < $starts.length; $j++) {
                            $starts[$j] = $start
                        }
                    }
                    $restart = true

                    for (;;) {
                        switch ($step) {
                        case 0:

                            object = {
                                body: {
                                    number: 0,
                                    data: []
                                },
                                checksum: null
                            }

                        case 1:

                            $accumulator['hash'] = hash

                        case 2:

                            $starts[0] = $start

                        case 3:

                            $_ = 0
                            $bite = 3

                        case 4:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 4
                                    ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                        $buffer: $buffer,
                                        $start: $starts[0],
                                        $end: $start,
                                        hash: $accumulator['hash']
                                    })
                                    return { start: $start, object: null, parse: $parse }
                                }
                                $_ += $buffer[$start++] << $bite * 8 >>> 0
                                $bite--
                            }

                            object.body.number = $_

                        case 5:

                            $i[0] = 0

                        case 6:

                            $step = 6

                            if ($start == $end) {
                                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                    $buffer: $buffer,
                                    $start: $starts[0],
                                    $end: $start,
                                    hash: $accumulator['hash']
                                })
                                return { start: $start, object: null, parse: $parse }
                            }

                            if ($buffer[$start] == 0x0) {
                                $start++
                                $step = 10
                                continue
                            }

                            $step = 7

                        case 7:

                        case 8:

                            if ($start == $end) {
                                $step = 8
                                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                    $buffer: $buffer,
                                    $start: $starts[0],
                                    $end: $start,
                                    hash: $accumulator['hash']
                                })
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.body.data[$i[0]] = $buffer[$start++]

                        case 9:

                            $i[0]++
                            $step = 6
                            continue

                        case 10:

                            ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                $buffer: $buffer,
                                $start: $starts[0],
                                $end: $start,
                                hash: $accumulator['hash']
                            })

                        case 11:

                            $_ = 0

                        case 12: {

                            const length = Math.min($end - $start, 16 - $_)
                            $buffers.push($buffer.slice($start, $start + length))
                            $start += length
                            $_ += length

                            if ($_ != 16) {
                                $step = 12
                                return { start: $start, object: null, parse: $parse }
                            }

                            object.checksum = $buffers.length == 1 ? $buffers[0] : Buffer.concat($buffers)
                            $buffers = []

                        }

                            ; (({ checksum = 0, hash }) => {
                                assert.deepEqual(hash.digest().toJSON(), checksum.toJSON())
                            })({
                                checksum: object.checksum,
                                hash: $accumulator['hash']
                            })

                        }

                        return { start: $start, object: object, parse: null }
                        break
                    }
                }
            }
        } ()
    }
}
