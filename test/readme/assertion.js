const sizeOf = {
    packet: function () {
        const assert = require('assert')

        return function (packet) {
            let $start = 0

            $start += 2

            return $start
        }
    } ()
}

const serializer = {
    all: {
        packet: function () {
            const assert = require('assert')

            return function (packet, $buffer, $start) {
                let $$ = []

                $$[0] = ($_ => {
                    assert($_ < 1000, 'excedes max value')
                    return $_
                })(packet.value, packet, [], [ 'packet', 'value' ], serialize)

                $buffer[$start++] = $$[0] >>> 8 & 0xff
                $buffer[$start++] = $$[0] & 0xff

                return { start: $start, serialize: null }
            }
        } ()
    },
    inc: {
        packet: function () {
            const assert = require('assert')

            return function (packet, $step = 0, $$ = []) {
                let $_, $bite

                return function $serialize ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        $$[0] = ($_ => {
                            assert($_ < 1000, 'excedes max value')
                            return $_
                        })(packet.value, packet, [], [ 'packet', 'value' ], serialize)

                    case 1:

                        $bite = 1
                        $_ = $$[0]

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, serialize: $serialize }
                            }
                            $buffer[$start++] = $_ >>> $bite * 8 & 0xff
                            $bite--
                        }

                    }

                    return { start: $start, serialize: null }
                }
            }
        } ()
    }
}

const parser = {
    all: {
        packet: function () {
            const assert = require('assert')

            return function ($buffer, $start) {
                let packet = {
                    value: 0
                }

                packet.value =
                    $buffer[$start++] << 8 |
                    $buffer[$start++]

                packet.value = ($_ => {
                    assert($_ < 1000, 'execdes max value')
                    return $_
                })(packet.value, packet, [], [ 'packet', 'value' ], parse)

                return packet
            }
        } ()
    },
    inc: {
        packet: function () {
            const assert = require('assert')

            return function (packet, $step = 0) {
                let $_, $bite

                return function $parse ($buffer, $start, $end) {
                    switch ($step) {
                    case 0:

                        packet = {
                            value: 0
                        }

                    case 1:

                        $_ = 0
                        $bite = 1

                    case 2:

                        while ($bite != -1) {
                            if ($start == $end) {
                                $step = 2
                                return { start: $start, object: null, parse: $parse }
                            }
                            $_ += $buffer[$start++] << $bite * 8 >>> 0
                            $bite--
                        }

                        packet.value = $_

                        packet.value = ($_ => {
                            assert($_ < 1000, 'execdes max value')
                            return $_
                        })(packet.value, packet, [], [ 'packet', 'value' ], parse)

                    }

                    return { start: $start, object: packet, parse: null }
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
                packet: function () {
                    return function (packet) {
                        return function ($buffer, $start, $end) {
                            let $$ = []

                            if ($end - $start < 2) {
                                return $incremental.packet(packet, 0, $$)($buffer, $start, $end)
                            }

                            $$[0] = ($_ => {
                                assert($_ < 1000, 'excedes max value')
                                return $_
                            })(packet.value, packet, [], [ 'packet', 'value' ], serialize)

                            $buffer[$start++] = $$[0] >>> 8 & 0xff
                            $buffer[$start++] = $$[0] & 0xff

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
                packet: function () {
                    return function () {
                        return function ($buffer, $start, $end) {
                            let packet = {
                                value: 0
                            }

                            if ($end - $start < 2) {
                                return $incremental.packet(packet, 1)($buffer, $start, $end)
                            }

                            packet.value =
                                $buffer[$start++] << 8 |
                                $buffer[$start++]

                            packet.value = ($_ => {
                                assert($_ < 1000, 'execdes max value')
                                return $_
                            })(packet.value, packet, [], [ 'packet', 'value' ], parse)

                            return { start: $start, object: object, parse: null }
                        }
                    } ()
                }
            }
        } (parser.inc)
    }
}
