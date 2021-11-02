module.exports = function ({ $lookup }) {
    return {
        object: function () {
            const crypto = require('crypto')
            const assert = require('assert')

            return function (object, {
                hash = (() => crypto.createHash('md5'))()
            } = {}, $step = 0, $i = [], $$ = [], $accumulator = {}, $starts = []) {
                let $_, $bite, $restart = false

                return function $serialize ($buffer, $start, $end) {
                    if ($restart) {
                        for (let $j = 0; $j < $starts.length; $j++) {
                            $starts[$j] = $start
                        }
                    }
                    $restart = true

                    for (;;) {
                        switch ($step) {
                        case 0:

                            $accumulator['hash'] = hash

                        case 1:

                            $starts[0] = $start

                        case 2:

                            $bite = 3
                            $_ = object.body.number

                        case 3:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 3
                                    ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                        $buffer: $buffer,
                                        $start: $starts[0],
                                        $end: $start,
                                        hash: $accumulator['hash']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }

                        case 4:

                            $i[0] = 0
                            $step = 5

                        case 5:

                            $bite = 0
                            $_ = object.body.data[$i[0]]

                        case 6:

                            while ($bite != -1) {
                                if ($start == $end) {
                                    $step = 6
                                    ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                        $buffer: $buffer,
                                        $start: $starts[0],
                                        $end: $start,
                                        hash: $accumulator['hash']
                                    })
                                    return { start: $start, serialize: $serialize }
                                }
                                $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                                $bite--
                            }
                            if (++$i[0] != object.body.data.length) {
                                $step = 5
                                continue
                            }

                            $step = 7

                        case 7:

                            if ($start == $end) {
                                $step = 7
                                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                    $buffer: $buffer,
                                    $start: $starts[0],
                                    $end: $start,
                                    hash: $accumulator['hash']
                                })
                                return { start: $start, serialize: $serialize }
                            }

                            $buffer[$start++] = 0x0

                        case 8:

                            ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                $buffer: $buffer,
                                $start: $starts[0],
                                $end: $start,
                                hash: $accumulator['hash']
                            })

                        case 9:

                            $$[0] = (({ $_, hash }) => $_ = hash.digest())({
                                $_: object.checksum,
                                hash: $accumulator['hash']
                            })

                        case 10:

                            $_ = 0

                        case 11: {

                                const length = Math.min($end - $start, $$[0].length - $_)
                                $$[0].copy($buffer, $start, $_, $_ + length)
                                $start += length
                                $_ += length

                                if ($_ != $$[0].length) {
                                    $step = 11
                                    return { start: $start, serialize: $serialize }
                                }

                            }

                        }

                        break
                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}
