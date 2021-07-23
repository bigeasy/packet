module.exports = function ({ $lookup }) {
    return {
        object: function () {
            return function ($buffer, $start) {
                let $_

                let object = {
                    header: {
                        type: 0,
                        flags: null
                    }
                }

                $_ = $buffer[$start++]

                object.header.type = $lookup[0][$_ >>> 4 & 0xf]

                switch (($ => $.header.type)(object)) {
                case 'publish':
                    object.header.flags = {
                        dup: 0,
                        qos: 0,
                        retain: 0
                    }

                    object.header.flags.dup = $_ >>> 3 & 0x1

                    object.header.flags.qos = $_ >>> 1 & 0x3

                    object.header.flags.retain = $_ & 0x1

                    break
                }

                return object
            }
        } ()
    }
}
