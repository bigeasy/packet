var packForSerialization = require('./pack')
var $ = require('programmatic')

function composeIncrementalSerializer (ranges) {
    var tmp = ''
    var variables = [ 'step', 'bite', 'next' ]

    ranges.forEach(function (range, rangeIndex) {
        var offset = 0

        range.pattern.forEach(function (field, patternIndex) {
            var step = field.index * 2
            if (field.endianness == 'x' && field.padding == null) {
                hoist('skip')
                hoist('remaining')
                tmp = $('                                                   \n\
                    ', tmp, '                                               \n\
                    case ' + step + ':                                      \n\
                        skip = start + ' + (field.bytes * field.repeat) + ' \n\
                        step = ' + (step + 1) + '                           \n\
                    case ' + (step + 1) + ':                                \n\
                        remaining = end - start                             \n\
                        if (remaining < skip) {                             \n\
                            skip -= remaining                               \n\
                            return end                                      \n\
                        }                                                   \n\
                        start += skip                                       \n\
                ')
            } else {
                var name = 'value'
                var key = field.name
                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bits = field.bits
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1
                var init, assign

                if (field.type == 'f') {
                    init = $('\n\
                        ' + name + ' = new ArrayBuffer(' + bytes + ')       \n\
                        new DataView(' + name + ').setFloat' + bits +
                            '(0, object. ' + key + ', true)                 \n\
                    ')
                    assign = name + '[bite]'
                    variables.push(name)
                } else if (field.packing) {
                    name = 'value'
                    init = packForSerialization(variables, field)
                    // todo: DRY
                    assign = name + ' >>> bite * 8 & 0xff'
                } else if (field.padding == null) {
                    name = field.arrayed ? 'array' : 'value'
                    hoist(name)
                    init = name + ' = object.' + (field.name || range.name)
                    if (field.lengthEncoding) {
                        init += '.length'
                    }
                    // todo: DRY see above
                    if (field.arrayed) {
                        name = 'array[i]'
                        init += '\ni = 0'
                    }
                    assign = name + ' >>> bite * 8 & 0xff'
                } else {
                    section.$initialization('                               \n\
                            $variable = 0x$padding                          \n\
                    ')
                    section.$padding(field.padding.toString(16))
                    var variable = 'value'
                }

                var compose = $('\n\
                    while (bite != ' + stop + ') {                      \n\
                       if (start == end) {                              \n\
                           return start                                 \n\
                       }                                                \n\
                       buffer[start++] = ' + assign + '                 \n\
                       ' + direction + '                                \n\
                    }                                                   \
                ')

                if (field.arrayed) {
                    variables.push('i')
                    compose = $('\n\
                        do {                                                \n\
                            ', compose, '                                   \n\
                            bite = ' + bite + '                             \n\
                        } while (++i < array.length)                        \n\
                    ')
                }

                // todo: bad indent on while loop below.
                tmp = $('\
                    ', tmp, '                                               \n\
                    case ' + step + ':                                      \n\
                        ', init, '                                          \n\
                        bite = ' + bite + '                                 \n\
                        step = ' + (step + 1) + '                           \n\
                    case ' + (step + 1) + ':                                \n\
                        ', compose, '                                       \n\
                ')
            }
        })
    })

    tmp = $('\
            switch (step) {                                                \n\
            ', tmp, '                                                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            if (next = callback && callback(object)) {                      \n\
                this.write = next                                           \n\
                return this.write(buffer, start, end)                       \n\
            }                                                               \n\
            // __blank__                                                    \n\
            return start                                                    \n\
    ')

    // TODO: Add a `var next` here.
    tmp = $('                                                               \n\
        this.write = function (buffer, start, end) {                        \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
        // __blank__                                                        \n\
        return this.write(buffer, start, end)                               \n\
    ')

    var vars = variables.map(function (variable) {
        return 'var ' + variable
    }).join('\n')

    tmp = $('                                                               \n\
        var inc                                                             \n\
        // __blank__                                                        \n\
        inc = function (buffer, start, end, step) {                         \n\
            ', vars, '                                                      \n\
            // __blank__                                                    \n\
            ', tmp, '                                                       \n\
        }                                                                   \n\
    ')


    return tmp

    function hoist (variable) {
        if (variables.indexOf(variable) === -1) {
            variables.push(variable)
        }
    }
}

module.exports = composeIncrementalSerializer
