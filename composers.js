var compile = require('./compiler')

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

                source.push('var .next;')
                source.push('var .bite;')
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
                this.parse = next;                                                                \n\
                return this.parse(buffer, start, end) \n\
            }                                                               \n\
            "__nl__" \n\
            return start \n\
         }                                                                  \n\
         ')

        console.log('y', require('./prettify')(compile('function foo () {', compile(source), '}')))
        process.exit(1)
    }

    return [ 'var inc;', '\n', 'inc = function (buffer, start, end, index) {',
        constructor(),
    '}' ]
}

exports.composeParser = function (ranges) {
    composeIncrementalParser(ranges)
}
