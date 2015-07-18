var $ = require('programmatic')

function pack (value, bits, offset, size) {
    var mask = 0xffffffff, shift
    mask = mask >>> 32 - bits
    mask = mask >>> bits - size
    shift = bits - offset - size
    mask = mask << shift >>> 0
    var source = shift
               ? value + ' << ' + shift + ' & 0x' + mask.toString(16)
               : value + ' & 0x' + mask.toString(16)
    return !offset && bits == 32 ? '(' + source + ') >>> 0' : source
}

function packForSerialization (variables, field) {
    variables.push('value')
    var signage
    var sum
    var bits = field.bytes * 8
    var bit = 0
    var assign = ' = '
    var first = true
    var assignment
    var packing = field.packing.filter(function (pack) {
        pack.offset = bit
        bit += pack.bits
        return pack.endianness != 'x' || pack.padding != null
    })
    var packed = packing.map(function (field, index) {
        var packed = pack('object.' + field.name, bits, field.offset, field.bits)
        if (packing.length > 1) {
            return '(' + packed + ')'
        } else {
            return packed
        }
        if (pack.signed) {
            if (!signage) signage = source()
            var mask = '0xff' + new Array(field.bytes).join('ff')
            var sign = source('\
                _$field = object[$name]                                     \n\
                if (_$field < 0)                                            \n\
                    _$field = 0x$bits + _$field + 1                         \
            ')
            sign.$field(pack.name)
            sign.$name(JSON.stringify(pack.name))
            sign.$bits((mask >>> (field.bits - pack.bits)).toString(16))
            signage(sign)
        }
        if (index == 0) {
            if (packing.length == 1) {
                assignment = source('\
                                                                            \n\
                    $signage                                                \n\
                    value = $sum                                            \n\
                ')
            } else {
                assignment = source('\
                                                                            \n\
                    $signage                                                \n\
                    value =                                                 \n\
                        $sum                                                \n\
                ')
            }
            sum = new source()
            hoist('value')
        }
        var fiddle = source()
        if (packing.length == 1) {
            fiddle = new source('$value << $bits')
        } else {
            fiddle = new source('($value << $bits) +')
        }
        if (pack.signed) {
            fiddle.$value('_' + pack.name)
            hoist('_' + pack.name)
        } else if (pack.padding == null) {
            fiddle.$value('object[$name]')
            fiddle.$name(JSON.stringify(pack.name))
        } else {
            fiddle.$value('0x$padding')
            fiddle.$padding(pack.padding.toString(16))
        }
        fiddle.$bits(field.bits - (pack.offset + pack.bits))
        if (sum) {
            sum(fiddle)
        }
        return
        var line = ''
        var reference = 'object[' + JSON.stringify(pack.name) + ']'
        var mask = '0xff' + new Array(field.bytes).join('ff')
        if (pack.endianness != 'x' || pack.padding != null) {
            if (pack.padding != null) {
                reference = '0x' + pack.padding.toString(16)
            }
            if (first) {
                if (pack.signed) {
                    hoist('unsigned')
                }
                first = false
            } else {
            }
            if (pack.signed) {
                //var bits = '0x' + (mask >>> (field.bits - pack.bits)).toString(16)
                // todo: not honoring top.
                var top = '0x' + (1 << pack.bits - 1).toString(16)
                section.line('unsigned = ' + reference)
                section.line('unsigned = unsigned < 0 ?')
                section.text(' (', bits, ' + unsigned + 1)')
                section.text(' : unsigned')
                reference = 'unsigned'
            }
            line += reference + ' << ' + (field.bits - (bit + pack.bits))
            line += ') +'
            section.line(line)
        }
        bit += pack.bits
    })
    packed = $('                                                            \n\
        value =                                                             \n\
            ', packed.join(' +\n'), '                                       \n\
    ')
    return packed
}

module.exports = packForSerialization
