var compile = require('./compiler')
var pretty = require('./prettify')

function str (value) {
    return JSON.stringify(value)
}

function composeIncrementalParser (ranges) {
    var variables = [], source = []

    function constructor () {
        var source = [ ]
        source.push('this.parse = function (buffer, start, end) {           \n\
            switch (index) {')
        ranges.forEach(function (range, rangeIndex) {
            range.pattern.forEach(function (field, fieldIndex) {
                var index = (rangeIndex + fieldIndex) * 2

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 'bite++' : 'bite--'
                var stop = little ? bytes : -1

                var fieldName = '_' + field.name
                var parseIndex = index + 1

                source.push('var .bite;')
                source.push('var .next;')
                source.push('var .' + fieldName + ';')

                source.push('\
                    case ' + index + ':                                     \n\
                        ' + fieldName + ' = 0                               \n\
                        bite = ' + bite + '                                 \n\
                        index = ' + parseIndex + '                          \n\
                    case ' + parseIndex + ':                                \n\
                        while (bite != ' + stop + ') {                      \n\
                            if (start == end) {                             \n\
                                return start                                \n\
                            }                                               \n\
                            ' + fieldName + ' +=                            \n\
                                Math.pow(256, bite) * buffer[start++]       \n\
                            ' + direction + '                               \n\
                        }')
                // sign fixup
                source.push('\
                    object[' + str(field.name) + '] = ' + fieldName + '     \n\
                ')
            })
        })

        source.push('\
                }                                                           \n\
            "__nl__"                                                        \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next;                                          \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
            "__nl__"                                                        \n\
            return start                                                    \n\
         }                                                                  \n\
         "__nl__"                                                           \n\
         return this.parse(buffer, start, end)                              \n\
         ')

        return compile(source)
    }

    return [ 'var .inc;', '\n', 'inc = function (buffer, start, end, index) {',
        constructor(),
    '}' ]
}

function fixupSignage (fieldName, operation) {
    var mask = '0xff' + new Array(field.bytes).join('ff')
    var sign = '0x80' + new Array(field.bytes).join('00')
    return [
        fieldName, ' = ', fieldName, ' & ', sign, ' ? (', mask, ' - ', fieldName,
            ' + 1) * -1 : , fieldName' ]
}

exports.composeParser = function (ranges) {
    composeIncrementalParser(ranges)

    var source = [ 'var .next;' ]

    ranges.forEach(function (range) {
        source.push('\n\
            if (end - start < ' + range.size + ') {                         \n\
                return inc.call(this, buffer, start, end, ' + range.patternIndex + ')    \n\
            }                                                               \n\
            "__nl__"                                                        \n\
        ')

        var offset = 0
        range.pattern.forEach(function (field, index) {
            if (field.endianness == 'x') {
                offset += field.bytes * field.repeat
            } else if (field.type == 'f') {
                var operation = source()

                var little = field.endianness == 'l'
                var bytes = field.bytes
                var bite = little ? 0 : bytes - 1
                var direction = little ? 1 : -1
                var stop = little ? bytes : -1

                hoist('_' + field.name)

                operation('\n\
                    _$field = new ArrayBuffer($size)                        \n\
                    $copy                                                   \n\
                    object[$name] = $extract                                \n\
                ')
                var copy = source()
                while (bite != stop) {
                    var assignment = source()
                    assignment('_$field[$index] = buffer[$inc]')
                    assignment.$field(field.name)
                    assignment.$inc(offset == 0 ? 'start' : 'start + $offset')
                    assignment.$index(bite)
                    assignment.$offset && assignment.$offset(offset)
                    offset++
                    //previous.$next(String(read))
                    copy(assignment)
                    bite += direction
                }
                operation.$copy(copy)
                operation.$extract('new DataView(_$field).getFloat$bits(0, true)')
                operation.$name(JSON.stringify(field.name))
                operation.$bits(field.bits)
                operation.$field(field.name)
                operation.$size(field.bytes)

                section(operation)
            } else {
                if (field.bytes == 1 && ! field.signed) {
                    assignment('\n\
                        $variable = buffer[$inc]                            \n\
                    ')
                    assignment.$inc(offset ? 'start + $offset' : 'start')
                    assignment.$offset && assignment.$offset(offset)
                    assignment.$variable('object[$name]')
                    offset++
                } else {
                    var little = field.endianness == 'l'
                    var bytes = field.bytes
                    var bite = little ? 0 : bytes - 1
                    var direction = little ? 1 : -1
                    var stop = little ? bytes : -1

                    var read = [], inc = ''
                    while (bite != stop) {
                        inc = offset == 0 ? 'start' : 'start + ' + offset
                        read.push('buffer[', inc, ']')
                        if (bite) {
                            read.push(' * ', '0x' + Math.pow(256, bite).toString(16))
                        }
                        read.push(' + ')
                        offset++
                        bite += direction
                    }
                    read.pop()
                    read = read.join('')
                    var variable
                    if (field.signed) {
                        var fieldName = '_' + field.name
                        var variable = fieldName

                        source.push('var .' + fieldName + ';')

                        assignment.$variable('_$field')
                        assignment.$field(field.name)
                        hoist('_' + field.name)
                        fixupSignage(field, assignment)
                        assignment('\
                            object[$name] = _$field; \n\
                        ')
                    } else {
                        var variable = 'object[' + str(field.name) + ']'
                    }
                    source.push([ variable, ' = ', read ].join(''))
                }
            }
        })

        if (range.fixed) source.push('\n\
            "__nl__"                                                         \n\
            start += ' + range.size + ';                                     \n\
        ')
    })

    if (false) {
    var parser = source()
    if (hoist()) {
        parser('\n\
            $variables                                                      \n\
            $sections                                                       \n\
                                                                            \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
                                                                            \n\
            return start                                                    \n\
        ')
        parser.$variables(hoist())
    } else {
        parser('\n\
            $sections                                                       \n\
                                                                            \n\
            if (next = callback(object)) {                                  \n\
                this.parse = next                                           \n\
                return this.parse(buffer, start, end)                       \n\
            }                                                               \n\
                                                                            \n\
            return start                                                    \n\
        ')
    }
    parser.$sections(sections)
    }

    source.push('\
        "__nl__"                                                            \n\
        if (next = callback(object)) {                                      \n\
            this.parse = next                                               \n\
            return this.parse(buffer, start, end)                           \n\
        }                                                                   \n\
        "__nl__"                                                            \n\
        return start                                                        \n\
    ')
    var body = compile('\
            ', composeIncrementalParser(ranges), '                          \n\
            "__nl__"                                                        \n\
            return function (buffer, start, end) {                          \n\
                ' + compile(source) + '                                     \n\
        }')
    return body
}
