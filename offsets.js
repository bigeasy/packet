function resolveAlternation (pattern, incoming) {
    if (pattern.some(function (field) { return field.alternation })) {
        var resolved = []
        var alternates = compiled.pattern.slice()
        for (var i = 0; i < alternates.length; i++) {
            var field = alternates[i]
            if (field.alternation) {
                field = field.alternation[0]
                if (field.pattern[0].packing) {
                    for (var j = 0, J = field.pattern[0].packing.length; j < J; j++) {
                        if (field.pattern[0].packing[j].named) {
                            field = field.pattern[0].packing[j]
                        }
                    }
                } else {
                    for (var j = 0, J = field.pattern.length; j < J; j++) {
                        if (field.pattern[j].named) {
                            field = field.pattern[j]
                        }
                    }
                }
                var value = incoming[field.name]

                field = alternates[i]
                for (j = 0, J = field.alternation.length; j < J; j++) {
                    var alternate = field.alternation[j]
                    if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
                        break
                    }
                }

                if (alternate.failed) {
                    throw new Error('Cannot match branch.')
                }

                alternates.splice.apply(alternates, [ i--, 1 ].concat(alternate.pattern))
                continue
            }
            resolved.push(field)
        }
        return resolved
    } else {
        return pattern
    }
}

function offsetsOf (buffer, offset) {
    if (Array.isArray(buffer)) buffer = new Buffer(buffer)

    var pattern = resolveAlternation(compiled.pattern, incoming)
    var patternIndex = 0
    var field = pattern[patternIndex]
    var offset = offset == null ? 0 : offset
    var output, record

    function dump (record) {
        if (buffer) {
            record.hex = buffer.slice(record.offset, record.offset + record.length).toString('hex')
        }
    }

    function detokenize (arrayed, count) {
         var scalar = (field.signed && field.type != 'f' ? '-' : '') +
                       field.endianness + field.bits +
                      (field.type == 'n' ? '' : field.type)
        if (field.padding) {
            var buffer = new Buffer(field.bits / 8), pad = field.padding
            for (var i = buffer.length -1; i != -1; i--) {
                buffer[i] = pad & 0xff
                pad >>> 8
            }
            scalar += '{0x' + buffer.toString('hex') + '}'
        }
        if (arrayed) {
            if (count) {
                return count.pattern + '/' + scalar
            } else if (field.terminator) {
                if (field.terminator[0]) {
                    // TODO: I'd prefer hex: b8z<0x0d0a>.
                    return scalar + 'z<' + field.terminator.join(',') + '>'
                } else {
                    return scalar + 'z'
                }
            } else {
                return scalar + '[' + field.repeat + ']'
            }
        } else if (field.packing) {
            return scalar + '{' + field.packing.map(function (field) {
                return (field.signed ? '-' : '') + field.endianness + field.bits
            }).join(',') + '}'
        } else {
            return scalar
        }
    }

    function _element (container, index) {
        var value = field.arrayed ? incoming[field.name][index] : incoming[field.name]
        var record =  { name: field.name,
                        pattern: detokenize(),
                        value: value,
                        offset: offset,
                        length: field.bits / 8 }
        if (!field.named) delete record.name; // add then remove for the sake of order.
        if (field.endianness == 'x') delete record.value
        if (field.arrayed) {
            delete record.name
            container.value[index] = record
        } else {
            container[index] = record
        }
        dump(record)
        return record.length
    }

    output = []
    while (field) {
        if (field.lengthEncoding) {
            var start = offset
            var element = pattern[++patternIndex]
            var record = { name: element.name, value: [], offset: 0 }
            output.push(record)
            var value = incoming[element.name]
            offset += _element(record, 'count')
            record.count.value = value.length
            field = element
            record.pattern = detokenize(true, record.count)
            for (var i = 0, I = value.length; i < I; i++) {
                offset += _element(record, i)
            }
            record.length = offset - start
            dump(record)
        } else if (field.terminator) {
            var start = offset,
                    record = { name: field.name, pattern: detokenize(true), value: [], offset: 0 },
                    value = incoming[field.name]
            output.push(record)
            for (var i = 0, I = value.length; i < I; i++) {
                offset += _element(record, i)
            }
            record.terminator = { value: field.terminator.slice(),
                                                        offset: offset,
                                                        length: field.terminator.length,
                                                        hex: new Buffer(field.terminator).toString('hex') }
            offset += field.terminator.length
            record.length = offset - start
            dump(record)
        } else if (field.arrayed) {
            var start = offset,
                    value = incoming[field.name],
                            // FIXME: offset is not zero. fix here and above.
                    record = { name: field.name, pattern: detokenize(true), value: [], offset: 0 }
            for (var i = 0, I = field.repeat; i < I; i++) {
                offset += _element(record, i)
            }
            record.length = offset - start
            dump(record)
            output.push(record)
        } else if (field.packing) {
            record = { pattern: detokenize(),
                                  value: [],
                                  offset: offset,
                                  length: field.bits / 8 }
            var bit = 0, hex = new Buffer(1)
            var packing = field.packing
            var start = offset
            for (var i = 0, I = packing.length; i < I; i++) {
                field = packing[i]
                var element = {
                    name: field.name,
                    pattern: detokenize(),
                    value: incoming[field.name],
                    bit: bit,
                    bits: field.bits
                }
                if (!field.named) delete element.name
                if (field.endianness == 'x') delete element.value
                record.value.push(element)
                if (buffer) {
                    element.hex = ''
                    element.binary = ''
                    var left = bit % 8, right = (8 - ((bit + field.bits) % 8)) & 7, b
                    var mask = 0xff >>> (bit % 8)
                    for (var j = Math.floor(bit / 8), J = Math.ceil((bit + field.bits) / 8); j < J; j++) {
                        b = buffer[offset + j]
                        element.binary +=  ('0000000' + b.toString('2')).slice(-8).substring(left)
                        hex[0] = buffer[offset + j] & (0xff >>> left)
                        left = 0
                        mask = 0xff
                        if (j == J - 1) {
                            hex[0] &= (0xff << right)
                            element.binary = element.binary.substring(0, element.binary.length - right)
                        }
                        element.hex += hex.toString('hex')
                    }
                }
                bit += field.bits
            }
            dump(record)
            output.push(record)
        } else {
            offset += _element(output, output.length)
        }
        field = pattern[++patternIndex]
    }
    return output
}
