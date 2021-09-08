const sizeOf = {
    object: function () {
        const assert = require('assert')
        const crypto = require('crypto')

        return function (object) {
            let $start = 0, $accumulator = {}

            $start += 4

            $start += 1 * object.body.string.length + 1

            $start += 16

            return $start
        }
    } ()
}

const serializer = {
    all: {
        object: function () {
            const assert = require('assert')
            const crypto = require('crypto')

            return function (object, $buffer, $start, {
                hash = (() => crypto.createHash('md5'))()
            } = {}) {
                let $_, $i = [], $$ = [], $accumulator = {}, $starts = []

                $accumulator['hash'] = hash

                $starts[0] = $start

                $buffer[$start++] = object.body.value >>> 24 & 0xff
                $buffer[$start++] = object.body.value >>> 16 & 0xff
                $buffer[$start++] = object.body.value >>> 8 & 0xff
                $buffer[$start++] = object.body.value & 0xff

                for ($i[0] = 0; $i[0] < object.body.string.length; $i[0]++) {
                    $buffer[$start++] = object.body.string[$i[0]] & 0xff
                }

                $buffer[$start++] = 0x0

                ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                    $buffer: $buffer,
                    $start: $starts[0],
                    $end: $start,
                    hash: $accumulator['hash']
                })

                $$[0] = (({ hash }) => hash.digest())({
                    hash: $accumulator['hash']
                })

                $_ = 0
                $$[0].copy($buffer, $start)
                $start += $$[0].length
                $_ += $$[0].length

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        object: function () {
            const assert = require('assert')
            const crypto = require('crypto')

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
                            $_ = object.body.value

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
                            $_ = object.body.string[$i[0]]

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
                            if (++$i[0] != object.body.string.length) {
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

                            $$[0] = (({ hash }) => hash.digest())({
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

const parser = {
    all: {
        object: function () {
            const assert = require('assert')
            const crypto = require('crypto')

            return function ($buffer, $start, {
                hash = (() => crypto.createHash('md5'))()
            } = {}) {
                let $_, $i = [], $slice = null, $accumulator = {}, $starts = []

                let object = {
                    body: {
                        value: 0,
                        string: []
                    },
                    checksum: null
                }

                $accumulator['hash'] = hash

                $starts[0] = $start

                object.body.value = (
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

                    object.body.string[$i[0]] = $buffer[$start++]

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
    },
    inc: {
        object: function () {
            const assert = require('assert')
            const crypto = require('crypto')

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
                                    value: 0,
                                    string: []
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

                            object.body.value = $_

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

                            object.body.string[$i[0]] = $buffer[$start++]

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

module.exports = {
    sizeOf: sizeOf,
    serializer: {
        all: serializer.all,
        inc: serializer.inc,
        bff: function ($incremental) {
            return {
                object: function () {
                    return function (object, {
                        hash = (() => crypto.createHash('md5'))()
                    } = {}) {
                        return function ($buffer, $start, $end) {
                            let $_, $i = [], $$ = [], $accumulator = {}, $starts = []

                            $accumulator['hash'] = hash

                            $starts[0] = $start

                            if ($end - $start < 5 + object.body.string.length * 1) {
                                return $incremental.object(object, {
                                    hash: hash
                                }, 2, $i, $$, $accumulator, $starts)($buffer, $start, $end)
                            }

                            $buffer[$start++] = object.body.value >>> 24 & 0xff
                            $buffer[$start++] = object.body.value >>> 16 & 0xff
                            $buffer[$start++] = object.body.value >>> 8 & 0xff
                            $buffer[$start++] = object.body.value & 0xff

                            for ($i[0] = 0; $i[0] < object.body.string.length; $i[0]++) {
                                $buffer[$start++] = object.body.string[$i[0]] & 0xff
                            }

                            $buffer[$start++] = 0x0

                            ; (({ $buffer, $start, $end, hash }) => hash.update($buffer.slice($start, $end)))({
                                $buffer: $buffer,
                                $start: $starts[0],
                                $end: $start,
                                hash: $accumulator['hash']
                            })

                            if ($end - $start < 16) {
                                return $incremental.object(object, {
                                    hash: hash
                                }, 9, $i, $$, $accumulator, $starts)($buffer, $start, $end)
                            }

                            $$[0] = (({ hash }) => hash.digest())({
                                hash: $accumulator['hash']
                            })

                            $_ = 0
                            $$[0].copy($buffer, $start)
                            $start += $$[0].length
                            $_ += $$[0].length

                            return { start: $start, serialize: null }
                        }
                    }
                } ()
            }
        } (serializer.inc)
    },
    parser: {
        all: parser.all,
        inc: parser.inc,
        bff: function ($incremental) {
            return {
                object: function () {
                    return function ({
                        hash = (() => crypto.createHash('md5'))()
                    } = {}) {
                        return function ($buffer, $start, $end) {
                            let $_, $i = [], $slice = null, $accumulator = {}, $starts = []

                            let object = {
                                body: {
                                    value: 0,
                                    string: []
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

                            object.body.value = (
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

                                object.body.string[$i[0]] = $buffer[$start++]

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
        } (parser.inc)
    }
}
