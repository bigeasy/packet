var parse   = require('./tokenizer').parse
var ieee754 = require('./ieee754')
var util    = require('util')

var __slice = [].slice

function canCompileSerializer (pattern) {
    return pattern.every(function (part) {
        return !part.terminator
            && !part.alternation
    })
}

function canCompileSizeOf (pattern) {
    return pattern.every(function (part) {
        return !part.alternation
    })
}

function classify () {
    var i, I, name
    for (i = 0, I = arguments.length; i < I; i++) {
        name = arguments[i].name
        if (name[0] == '_')
            this.__defineGetter__(name.slice(1), arguments[i])
        else
            this[arguments[i].name] = arguments[i]
    }
    return this
}

function hexify (number) {
    var string = number.toString(16)
    if (string.length % 2) {
        string = '0' + string
    }
    return '0x' + string
}

// The default transforms built into Packet.
var transforms =
// Convert the value to and from the given encoding.
{ str: function (encoding, parsing, field, value) {
    var i, I, ascii = /^ascii$/i.test(encoding)
        if (parsing) {
            value = new Buffer(value)
            // Broken and waiting on [297](http://github.com/ry/node/issues/issue/297).
            // If the top bit is set, it is not ASCII, so we zero the value.
            if (ascii) {
                for (i = 0, I = value.length; i < I; i++) {
                    if (value[i] & 0x80) value[i] = 0
                }
                encoding = 'utf8'
            }
            var length = value.length
            return value.toString(encoding, 0, length)
        } else {
            var buffer = new Buffer(value, encoding)
            if (ascii) {
                for (var i = 0, I = buffer.length; i < I; i++) {
                    if (value.charAt(i) == '\u0000') buffer[i] = 0
                }
            }
            return buffer
        }
    }
// Convert to and from ASCII.
, ascii: function (parsing, field, value) {
        return transforms.str('ascii', parsing, field, value)
    }
// Convert to and from UTF-8.
, utf8: function (parsing, field, value) {
        return transforms.str('utf8', parsing, field, value)
    }
// Add padding to a value before you write it to stream.
, pad: function (character, length, parsing, field, value) {
        if (! parsing) {
            while (value.length < length) value = character + value
        }
        return value
    }
// Convert a text value from alphanumeric to integer.
, atoi: function (base, parsing, field, value) {
        return parsing ? parseInt(value, base) : value.toString(base)
    }
// Convert a text value from alphanumeric to float.
, atof: function (parsing, field, value) {
        return parsing ? parseFloat(value) : value.toString()
    }
}
/*
function die () {
    console.log.apply(console, [].slice.call(arguments, 0))
    process.exit(1)
}

function say () { console.log.apply(console, [].slice.call(arguments, 0)) }
*/
// The `Definition` class is contained by the `Serializer` and parser. We expose
// public methods by explicitly adding the methods to the `Serializer` or
// `Parser` when we create them. The `Definition` class references only enclosed
// variables, but it does use prototypical inheritance to extend the collections
// of packet patterns and transforms.

function Source () {
    this._lines = []
    this._indent = 0
    this._hoisted = []
}

Source.prototype._indentation = function () {
    return new Array(this._indent + 1).join('  ')
}

Source.prototype.line = function () {
    var line = __slice.call(arguments).join('')
    if (line.length) this._lines.push(this._indentation() + line)
    else this._lines.push('')
    return this
}

Source.prototype.text = function () {
    var text = __slice.call(arguments).join('')
    this._lines[this._lines.length - 1] += text
}

Source.prototype.consume = function (prefix, source) {
    if (!source) {
        source = prefix
        prefix = null
    }
    if (prefix == null) {
        var indentation = this._indentation()
        this._lines.push.apply(this._lines, source._lines.map(function (line) {
            return indentation + line
        }))
    } else {
        this.text(prefix)
        this.text(source._lines[0])
    }
    this.hoist.apply(this, source._hoisted)
    source._lines.length = 0
    source._hoisted.length = 0
}

Source.prototype.hoist = function () {
    __slice.call(arguments).forEach(function (variable) {
        if (!~this._hoisted.indexOf(variable)) this._hoisted.push(variable)
    }, this)
}

Source.prototype.dent = function () {
    var vargs = __slice.call(arguments)
    var block, end, context
    if (typeof vargs[0] == 'string') {
        this.line(vargs.shift())
    }
    block = vargs.shift()
    if (typeof vargs[0] == 'string') {
        end = vargs.shift()
    }
    context = vargs.shift()
    var source = new Source
    this._indent++
    block.call(context, source)
    this.consume(source)
    this._indent--
    this.line(end)
    return this
}

Source.prototype.shift = function (block, context) {
    var source = new Source
    this._indent++
    block.call(context, source)
    this.consume(source)
    this._indent--
    return this
}

Source.prototype.block = function (source) {
    source = source.split(/\n/)
    source.shift()
    source.pop()
    var spaces =  source[0].length - source[0].replace(/^\s+/, '').length
    source.forEach(function (line) {
        line = line.substring(spaces).replace(/\s+$/, '')
        if (/\S/.test(line)) this.line(line)
        else this.line(line)
    }, this)
    return this
}

Source.prototype.replace = function () {
    var last = this._lines[this._lines.length - 1]
    last = last.replace.apply(last, __slice.call(arguments))
    this._lines[this._lines.length - 1] = last
}

Source.prototype.define = function () {
    var source = new Source
    source.line('function (', __slice.call(arguments).join(', '), ') {')
    source.shift(function (source) {
        if (this._hoisted.length) {
            source.line('var ', this._hoisted.join(', '), ';')
            source.line()
        }
        source.consume(this)
    }, this)
    source.line('}')
    return String(source)
}

Source.prototype.toString = function () {
    if (this._lines.length > 1) {
        return this._lines.join('\n') + '\n'
    } else {
        return this._lines[0]
    }
}

var parameters = [ 'incremental', 'terminator', 'pattern', 'transforms', 'ieee754', 'object', 'callback' ]

function Definition (packets, transforms, options) {
    packets = Object.create(packets)
    this.transforms = transforms = Object.create(transforms)
    options = options || {}
    if (!('compile' in options)) options.compile = true

    var precompiler = options.precompiler || function (type, pattern, parameters, source) {
        return Function.apply(Function, parameters.concat(source.join('\n')))
    }

    // we can't disable compilation anymore. compiled sizeof is not going to
    // have a fallback.
    function uncompiledParser (incremental, terminator, pattern, transforms, ieee754, object, callback) {
        return function (buffer, start, end) {
            return incremental.call(this, buffer, start, end, pattern, 0, object, callback)
        }
    }

    function compileParser (object) {
        if (!options.compile) return uncompiledParser

        var pattern = object.pattern
        var prefix = [ 'parser' ]

        function inc (increment) {
            if (increment) return 'start++'
            if (offset++) return 'start + ' + (offset - 1)
            return 'start'
        }

        function unsigned (source, variable, field, increment) {
            var little = field.endianness == 'l'
            var bytes = field.bytes
            var bite = little ? 0 : bytes - 1
            var direction = little ? 1 : -1
            var stop = little ? bytes : -1
            var line = new Source
            var sign = '0x80' + new Array(field.bytes).join('00')
            var mask = '0xff' + new Array(field.bytes).join('ff')
            var assign

            function multiply (bite) {
                var pow = '0x' + Math.pow(256, bite).toString(16)
                var line = 'buffer[' + inc(increment) + '] * ' + pow + ' +'
                line = line.replace(/ \* 1 \+$/, ' +')
                line = line.replace(/start \+ 0/, 'start')
                line = line.replace(/ \* 0x1\b/, '')
                return line
            }

            if (field.signed) {
                source.hoist('value')
                source.line('value =')
                assign = true
            } else {
                source.line(variable)
            }

            if (bytes == 1) {
                source.text(' ' + multiply(0).replace(/ \+$/, ''))
            } else {
                source.dent(function (source) {
                    while (bite != stop) {
                        source.line(multiply(bite))
                        bite += direction
                    }
                    source.replace(/ \+$/, ';')
                })
            }
            if (field.signed) {
                source.line(variable + ' (value & ' + sign + ') ? (' + mask + ' - value + 1) * -1 : value;')
            }
            return source
        }

        function floating (source, variable, field) {
            var little = field.endianness == 'l',
                    suffix = little ? 'LE' : 'BE',
                    bytes = field.bytes,
                    size = bytes == 4 ? options.buffersOnly ? 'Float' : 'Single' : 'Double',
                    bite = little ? 0 : bytes - 1,
                    direction = little ? 1 : -1,
                    gather = new Source,
                    stop = little ? bytes : -1,
                    line
            source.hoist('value')
            if (options.buffersOnly) {
                source.line(variable + ' buffer.read' + size + suffix + '(' + offset + ', true)')
                if (!~prefix.indexOf('buffersOnly')) prefix.push('buffersOnly')
            } else {
                gather.line('value = new Array(' + bytes + ');')
                while (bite != stop) {
                    line = 'value[' + bite + '] = buffer[start + ' + (offset++)  + '];'
                    line = line.replace(/start \+ 0/, 'start')
                    gather.line(line)
                    bite += direction
                }
                source.consume(gather)
                // todo: get rid of reverse
                source.line(variable + ' ieee754.fromIEEE754' + size + '(value.reverse());')
            }
            return source
        }

        function element (assign, variable, field, increment) {
            switch (field.type) {
            case 'f':
                return floating(assign, variable, field, increment)
            default:
                return unsigned(assign, variable, field, increment)
            }
        }

        function rangeCheck (condition, start, index) {
            var source = new Source
            source.block('                                                                        \n\
                if (' + condition + ') {                                                            \n\
                    return incremental.call(this, buffer, ' + start + ', end, pattern, ' + index + ', object, callback);  \n\
                }                                                                                   \n\
            ')
            source.line()
            return source
        }

        var method = new Source
        var section = new Source
        var offset = 0
        var sum = 0
        var sums = []
        var fixed = true
        var length = []
        var unfixify = false

        method.hoist('read')

        function fix () {
            if (!fixed) fixed = true
        }

        function unfix () {
        }

        function doRangeCheck () {
            if (sum) {
                method.consume(rangeCheck('end - start < ' + sum, 'start', patternIndex))
                method.consume(section)
                sums.push(sum)
                sum = 0
            }
        }

        // TODO: Slice buffers. If signed, then slice and fixup.
        // TODO: With a fixed length buffer for a terminated array, give up early,
        // not at each test.
        // TODO: Would it be faster to have the same scan for a terminator, then
        // come back and iterate? No because in the best case, we're not giving up.
        // How about, if it's not fixed, give up and increment? So, once we're
        // moving the `start`, we give up on trying to have nice fixed numbers.
        var offset = 0, patternIndex = 0
        function unravel (field, index) {
            if (field.lengthEncoding) return
            if (field.alternation) {
                if (!~length.indexOf('(start - first)')) length.push('(start - first)')
                var was = offset
                section.hoist('value')
                section.hoist('first = start')
                element(section, 'value =', field)
                sum += field.bytes
                doRangeCheck()
                sums.pop()
                offset = was
                var elsed = false
                field.alternation.forEach(function (alternate, ai) {
                    var cond = new Source
                    var read = alternate.read
                    if (read.minimum == Number.MAX_VALUE && read.maximum == -Number.MAX_VALUE) {
                        return
                    }
                    if (read.mask) {
                        cond.line(ai ? '} else ' : '', 'if ')
                        cond.text('(value & 0x', read.mask.toString(16), ') {')
                        method.consume(cond)
                        var was = offset
                        // TODO: It will only do one, then the offsets will be off!
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        alternate.pattern.forEach(unravel)
                        method.shift(function (method) {
                            section.line('start += ', sum + ';')
                            doRangeCheck()
                            sums.pop()
                        })
                        offset = was
                    } else if (read.minimum == read.maximum) {
                        cond.line(ai ? '} else ' : '', 'if ')
                        cond.text('(', read.minimum, ' == value) {')
                        method.consume(cond)
                        var was = offset
                        // TODO: It will only do one, then the offsets will be off!
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        alternate.pattern.forEach(unravel)
                        method.shift(function () {
                            section.line('start += ', sum + ';')
                            doRangeCheck()
                            sums.pop()
                        })
                        offset = was
                    } else if (read.minimum == -Number.MAX_VALUE && read.maximum == Number.MAX_VALUE) {
                        if (!elsed) {
                            elsed = true
                            cond.line('} else {')
                            method.consume(cond)
                            if (alternate.failed) section.line('  throw new Error("Cannot match branch.");')
                            else {
                        var was = offset
                        // TODO: It will only do one, then the offsets will be off!
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        alternate.pattern.forEach(unravel)
                        method.shift(function () {
                            section.line('start += ', sum + ';')
                            doRangeCheck()
                            sums.pop()
                        })
                        offset = was
                            }
                        }
                    } else {
                        cond.line(ai ? '} else ' : '', 'if ')
                        cond.text('(', read.minimum, ' <= value && value <= ', read.maximum, ') {')
                        method.consume(cond)
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        var was = offset
                        section.shift(function (section) {
                            section.line('start += ', sum + ';')
                            alternate.pattern.forEach(unravel)
                            section.line('start += ', sum + ';')
                        })
                        doRangeCheck()
                        sums.pop()
                        offset = was
                    }
                })
                section.line('}')
            } else if (field.endianness == 'x') {
                fix()
                sum += field.bytes * field.repeat
                offset += field.bytes * field.repeat
            } else if (field.arrayed) {
                section.hoist('array')
                if (index && pattern[index - 1].lengthEncoding) {
                    var counter = pattern[index - 1]
                    method.hoist('first = start')
                    if (!~length.indexOf('(start - first)')) length.push('(start - first)')
                    method.hoist('count')
                    method.hoist('i')
                    element(section, 'count =', counter, true)
                    section.line('array = [];')
                    section.line('for (i = 0; i < count; i++) {')
                    element(section, '  array[i] =', field, true)
                    section.line('}')
                    section.line()
                } else if (field.terminator) {
                    unfixify = true
                    if (sum) {
                        method.consume(rangeCheck('end - start < ' + sum, 'start', patternIndex))
                        method.consume(section)
                        sums.push(sum)
                        sum = 0
                    }
                    section.hoist('value')
                    method.hoist('first = start')
                    method.hoist('second')
                    section.line('second = start')
                    section.line('array = [];')
                    if (field.terminator.length == 1) {
                        section.line('for (;;) {')
                        section.shift(function (section) {
                            if (field.repeat != Number.MAX_VALUE) {
                                section.line('if (array.length == ' + field.repeat + ') break;')
                            }
                            if (field.bytes == 1) {
                                section.consume(rangeCheck('start == end', 'second', patternIndex))
                            } else {
                                section.consume(rangeCheck('start + ' + (field.bytes - 1) + ' >= end', 'second', patternIndex))
                            }
                            element(section, 'value =', field)
                            section.line('start += ' + field.bytes + ';')
                            section.line('if (value == ' + field.terminator[0] + ') break;')
                            section.line('array.push(value);')
                        }).line('}')
                    } else {
                        section.line('for (;;) {').shift(function (section) {
                            if (field.bytes == 1) {
                                section.consume(rangeCheck('start == end', 'second', patternIndex))
                            } else {
                                section.consume(rangeCheck('start + ' + (field.bytes - 1) + ' >= end', 'second', patternIndex))
                            }
                            if (field.repeat != Number.MAX_VALUE) {
                                section.line('if (array.length == ' + field.repeat + ') break;')
                            }
                            var condition = field.terminator.map(function (value, index) {
                                return '' + value + ' == array[array.length - ' +
                                                        Math.abs((index - field.terminator.length)) + ']'
                            }).join(' && ')
                            element(section, 'value =', field)
                            section.block('\n\
                                start += ' + field.bytes + ';                         \n\
                                array.push(value);                                    \n\
                                if (' + condition + ') {                              \n\
                                    array.splice(-' + field.terminator.length + ');   \n\
                                    break;                                            \n\
                                }                                                     \n\
                            ')
                        }).line('}')
                    }
                    patternIndex = index + 1
                    if (!~length.indexOf('(start - first)')) length.push('(start - first)')
                    if (field.repeat != Number.MAX_VALUE) {
                        // TODO: Ugly. Faster with offset to track count instead of array length?
                        // TODO: Slice buffers.
                        section.line('start += ' + field.repeat + ' - array.length;')
                        section.line('if (array.length < ' + field.repeat + ') {')
                        section.line('  start -= ' + field.terminator.length + ';')
                        section.line('}')
                    }
                    offset = 0
                } else {
                    section.line('array = new Array(' + field.repeat + ');')
                    for (var i = 0, I = field.repeat; i < I; i++) {
                        element(section, 'array[' + i + '] =', field)
                    }
                    sum += field.bytes * field.repeat
                }
                if (field.pipeline) {
                    field.pipeline.forEach(function (transform) {
                        var parameters = transform.parameters.map(function (paramaeter) {
                            return JSON.stringify(paramaeter)
                        }).concat([ 'true', 'null', 'array' ]).join(', ')
                        section.line('array = transforms.', transform.name, '(', parameters, ');')
                    })
                }
                section.line('object[' + JSON.stringify(field.name) + '] = array;')
            } else {
                var code = new Source()
                if (field.packing) {
                    section.hoist('value')
                    element(section, 'value =', field)
                    var bit = 0
                    for (var i = 0, I = field.packing.length; i < I; i++) {
                        var pack = field.packing[i]
                        var mask = '0xff' + new Array(field.bytes).join('ff')
                        if (pack.endianness != 'x') {
                            if (pack.signed) {
                                section.hoist('unsigned')
                                section.line('unsigned')
                            } else {
                                section.line('object[' + JSON.stringify(pack.name) + ']')
                            }
                            section.text(' = ')
                            section.text('(value & (', mask, ' >> ', bit, '))')
                            section.text(' >> ', (field.bits - (bit + pack.bits)), ';')
                            if (pack.signed) {
                                var bits = '0x' + (mask >>> (field.bits - pack.bits)).toString(16)
                                var top = '0x' + (1 << pack.bits - 1).toString(16)
                                section.line('object[' + JSON.stringify(pack.name) + ']')
                                section.text(' = ', top , ' & unsigned ?')
                                section.text(' (', bits, ' - unsigned + 1) * -1')
                                section.text(' : unsigned;')
                            }
                        }
                        bit += pack.bits
                    }
                } else {
                    if (field.pipeline) {
                        section.hoist('value')
                        element(section, 'value =', field)
                        field.pipeline.forEach(function (transform) {
                            var parameters = transform.parameters.map(function (paramaeter) {
                                return JSON.stringify(paramaeter)
                            }).concat([ 'true', 'null', 'value' ]).join(', ')
                            section.line('value = transforms.', transform.name, '(', parameters, ');')
                        })
                        section.line('object[' + JSON.stringify(field.name) + '] = value;')
                    } else {
                        element(section, 'object[' + JSON.stringify(field.name) + '] =', field)
                    }
                }
                sum += field.bytes
            }
            section.line()
            if (unfixify) {
                if (sum) {
                    var range = rangeCheck('end - start < ' + sum, 'start', patternIndex)
                    method.consume(range)
                }
                method.consume(section)
                unfixify = false
            }
        }
        pattern.forEach(unravel)

        function unfix (index, block) {
            if ((true || fixed) && sum) {
                method.consume(rangeCheck('end - start < ' + sum, 'start', patternIndex))
                method.consume(section)
                sums.push(sum)
                method.line()
                method.line('start += ' + sum)
                method.line()
                sum = 0
            }
            var source = new Source
            var range = function (field, variable) {
                var summary = variable + '.length'
                if (field.terminator) summary += ' + ' + field.terminator.length
                source.consume(rangeCheck('end - start < ' + summary, 'start', index))
                fixed = false
            }
            block(source, range)
            method.consume(source)
        }

        if (sum) {
            unfix(pattern.length, function () {})
        } else {
            method.consume(section)
        }

        if (sums.length) {
            length.push(sums.reduce(function (sum, value) { return sum + value }, 0))
        }

        var substart = length.slice()
        if (~length.indexOf('(start - first)')) substart.unshift('first')

        method.block('                                                    \n\
            return callback(object)                                       \n\
        ')

        var parser = ('return ' + method.define('buffer', 'start', 'end')).split(/\n/)
        parser.pop()

        return precompiler(prefix.join('.'), pattern, parameters, parser)
    }

    function compileSerializer (object) {
        var method = new Source
        var section = new Source
        var offset = 0
        var sum = 0
        var fixed = 0
        var sums = []
        var lengths = []
        var incrementalIndex = 0
        var pattern = object.pattern
        var variables = {}
        var prefix = [ 'serializer' ]

        function unsigned (variable, field, increment) {
            var source = new Source
            var little = field.endianness == 'l'
            var bytes = field.bytes
            var bite = little ? 0 : bytes - 1
            var direction = little ? 1 : -1
            var stop = little ? bytes : -1
            var assign
            function inc () {
                if (increment) return 'start++'
                if (offset++) return 'start + ' + (offset - 1)
                return 'start'
            }
            if (field.endianness == 'x') {
                if (field.padding == null) {
                    if (increment) {
                        source.line('start += ' + field.bytes)
                        source.line()
                    } else {
                        offset += field.bytes
                    }
                    return source
                } else {
                    while (bite != stop) {
                        source.line('buffer[' + inc() + '] = 0x' + ((field.padding >> (bite * 8)) & 0xff).toString(16))
                        bite += direction
                    }
                    source.line()
                    return source
                }
            }
            if (bytes == 1) {
                source.line('buffer[' + inc() + '] = ' + variable)
            } else {
                source.hoist('value')
                source.line('value = ' + variable)
                while (bite != stop) {
                    if (bite == 0) {
                        source.line('buffer[' + inc() + '] = value & 0xff')
                    } else {
                        source.line('buffer[' + inc() + '] = (value >>> ' + (bite * 8) + ') & 0xff')
                    }
                    bite += direction
                }
            }

            return source
        }

        function floating (variable, field, increment) {
            // todo: tidy, dead variables
            var little = field.endianness == 'l'
            var suffix = little ? 'LE' : 'BE'
            var bytes = field.bytes
            var size = bytes == 4 ? options.buffersOnly ? 'Float' : 'Single' : 'Double'
            var bite = little ? 0 : bytes - 1
            var direction = little ? 1 : -1
            var gather = new Source
            var stop = little ? bytes : -1
            var source = new Source
            var line
            function inc () {
                if (increment) return 'start++'
                if (offset++) return 'start + ' + (offset - 1)
                return 'start'
            }
            source.hoist('value')
            if (options.buffersOnly) {
                source.line('buffer.write' + size + suffix + '(' + variable + ',' + offset + ', true)')
                if (!~prefix.indexOf('buffersOnly')) prefix.push('buffersOnly')
            } else {
                source.line('value = ieee754.toIEEE754' + size + '(' + variable + ')')
                while (bite != stop) {
                    source.line('buffer[' + inc() + '] = value[' + (bytes - bite - 1) + ']')
                    bite += direction
                }
            }
            source.line()
            return source
        }

        function element (variable, field, increment) {
            switch (field.type) {
            case 'f':
                return floating(variable, field, increment)
            default:
                return unsigned(variable, field, increment)
            }
        }

        function rangeCheck (condition, start, index) {
            var source = new Source
            source.block('                                                                        \n\
                if (' + condition + ') {                                                          \n\
                  return incremental.call(this, buffer, ' + start + ', end, pattern, ' + index + ', object, callback);  \n\
                }                                                                                 \n\
            ')
            source.line()
            return source
        }

        function exit (start, index) {
            var source = new Source
            source.line('return incremental.call(this, buffer, ' + start + ', end, pattern, ' + index + ', object, callback)')
            return source
        }

        var section = new Source
        var count = 0
        var fixed = true

        function possiblyTerminated (field, index) {
            var variable = 'field' + (++count)
            var reference = 'object[' + JSON.stringify(field.name) + ']'
            return function (section, rangeCheck) {
                section.hoist(variable, 'i', 'I')
                section.line(variable + ' = ' + reference)
                if (field.pipeline) field.pipeline.slice().reverse().forEach(function (transform) {
                    var parameters = transform.parameters.map(function (paramaeter) {
                        return JSON.stringify(paramaeter)
                    }).concat([ 'false', 'null', variable ]).join(', ')
                    section.line(variable, ' = transforms.', transform.name, '(', parameters, ')')
                })
                rangeCheck(field, variable)
                section.dent('for (i = 0, I = ' + variable + '.length; i < I; i++) {', function (section) {
                    section.consume(element(variable + '[i]', field, true))
                }, '}')
                variables[field.name] = variable
                if (field.terminator) {
                    if (field.length == Math.MAX_VALUE) {
                        for (var i = 0; i < field.terminator.length; i++) {
                            section.line('buffer[start++] = ' + hexify(field.terminator[i]))
                        }
                    } else {
                        throw new Error
                    }
                }
                section.line()
            }
        }


        function fix (index, block) {
            if (!fixed) {
                fixed = true
                incrementalIndex = index
            }
            var source = new Source
            block(source)
            section.consume(source)
        }

        function unfix (index, block) {
            if (fixed && sum) {
                method.consume(rangeCheck('end - start < ' + sum, 'start', incrementalIndex))
                method.consume(section)
                sums.push(sum)
                method.line()
                method.line('start += ' + sum)
                method.line()
                sum = 0
            }
            var source = new Source
            var range = function (field, variable) {
                var summary = variable + '.length'
                if (field.terminator) summary += ' + ' + field.terminator.length
                source.consume(rangeCheck('end - start < ' + summary, 'start', index))
                fixed = false
            }
            block(source, range)
            method.consume(source)
        }

        // todo: size is sizeOf and calculated just as sizeOf
        function unravel (field, index) {
            var reference = 'object[' + JSON.stringify(field.name) + ']'
            var variable = 'field' + (++count)
            if (index && pattern[index - 1].lengthEncoding) {
                unfix(index - 1, function (section) {
                    section.hoist(variable, 'i', 'I')
                    section.line(variable + ' = ' + reference)
                    rangeCheck(field, variable)
                    section.consume(element(variable + '.length', pattern[index - 1], true))
                    section.dent('for (i = 0, I = ' + variable + '.length; i < I; i++) {', function (section) {
                        section.consume(element(variable + '[i]', field, true))
                    }, '}')
                    variables[field.name] = variable
                })
            } else if (field.arrayed) {
                if (field.endianness == 'x') {
                    fix(index, function (section) {
                        fixed += field.repeat * field.bytes
                        if (field.padding == null) {
                            offset += field.repeat * field.bytes
                            sum += field.repeat * field.bytes
                        } else {
                            section.hoist('i')
                            section.dent('for (i = 0; i < ' + field.repeat + '; i++) {', function (section) {
                                section.consume(element(variable + '[i]', field, true))
                            }, '}')
                        }
                    })
                } else {
                    if (field.length == Math.MAX_VALUE) {
                        unfix(index, possiblyTerminated(field, variable, reference))
                    } else {
                        fix(index, possiblyTerminated(field, variable, reference))
                    }
                }
            } else if (!field.lengthEncoding) {
                if (field.packing) {
                    fix(index, function (section) {
                        section.hoist('value')
                        var bit = 0
                        var assign = ' = '
                        var first = true
                        for (var i = 0, I = field.packing.length; i < I; i++) {
                            var line = ''
                            var pack = field.packing[i]
                            var reference = 'object[' + JSON.stringify(pack.name) + ']'
                            var mask = '0xff' + new Array(field.bytes).join('ff')
                            if (pack.endianness != 'x' || pack.padding != null) {
                                if (pack.padding != null) {
                                    reference = '0x' + pack.padding.toString(16)
                                }
                                if (first) {
                                    if (pack.signed) {
                                        section.hoist('unsigned')
                                    }
                                    line = 'value'
                                    line = 'value = ('
                                    first = false
                                } else {
                                    line = '  ('
                                }
                                if (pack.signed) {
                                    var bits = '0x' + (mask >>> (field.bits - pack.bits)).toString(16)
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
                        }
                        section.replace(/ \+$/, '')
                        section.replace(/ << 0\)$/, ')')
                        section.consume(element('value', field))
                        sum += field.bytes
                    })
                } else {
                    fix(index, function (section) {
                        if (field.pipeline) {
                            section.hoist(variable)
                            section.line(variable + ' = ' + reference)
                            field.pipeline.slice().reverse().forEach(function (transform) {
                                var parameters = transform.parameters.map(function (paramaeter) {
                                    return JSON.stringify(paramaeter)
                                }).concat([ 'false', 'null', variable ]).join(', ')
                                section.line(variable, ' = transforms.', transform.name, '(', parameters, ')')
                            })
                            section.consume(element(variable, field))
                        } else {
                            section.consume(element(reference, field))
                        }
                        sum += field.bytes * field.repeat
                    })
                }
            }
        }

        pattern.forEach(unravel)

        if (sum) {
           unfix(pattern.length, function () { })
        } else {
            method.consume(section)
        }

        if (fixed) {
            sums.unshift(fixed)
        }

        if (sums.length) {
            lengths.push(sums.reduce(function (sum, value) { return sum + value }, 0))
        }

        method.line()

        method.block('                                          \n\
            this.write = terminator                             \n\
                                                                \n\
            callback()                                          \n\
                                                                \n\
            if (this.write === terminator) {                    \n\
                return start                                    \n\
            }                                                   \n\
                                                                \n\
            return this.write(buffer, start, end)               \n\
        ')

        var serializer = ('return ' + method.define('buffer', 'start', 'end')).split(/\n/)
        serializer.pop()

        return precompiler(prefix.join('.'), pattern, parameters, serializer)
    }

    function sizeOfName (variable) {
        return 'sizeOf' + variable[0].toUpperCase() + variable.substring(1)
    }

    function sizeOfSource (assignment, variables, object) {
        var pattern = object.pattern
        var source = new Source

        var values = []
        var fixed = 0

        function unravel (field, index) {
            var variable = variables[field.name] || 'object[' + JSON.stringify(field.name) + ']'
            if (index && pattern[index - 1].lengthEncoding) {
                if (field.bytes == 1) {
                    values.push(variable + '.length')
                } else {
                    values.push('(' + variable + '.length * ' + field.bytes + ')')
                }
            } else if (field.arrayed) {
                if (field.repeat != Number.MAX_VALUE) {
                    fixed += field.bytes * field.repeat
                } else {
                    if (field.bytes == 1) {
                        values.push(variable + '.length')
                    } else {
                        values.push('(' + variable + '.length * ' + field.bytes + ')')
                    }
                    if (field.terminator) {
                        fixed += field.terminator.length
                    }
                }
            } else {
                fixed += field.bytes * field.repeat
            }
        }

        pattern.forEach(unravel)

        if (fixed) values.push(fixed)

        if (values.length == 1) {
            source.line(assignment, ' ', values[0])
        } else {
            source.dent(assignment + '(', function (source) {
                values.forEach(function (value, index) {
                    source.line(value, index < values.length - 1 ? ' +' : '')
                })
            }, ')')
        }

        return source
    }

    function compileSizeOf (object) {
        var pattern = object.pattern
        var source = new Source

        var variables = []
        var count = 0

        function unravel (field, index) {
            var reference = 'object[' + JSON.stringify(field.name) + ']'
            var variable = 'field' + (++count)
            if (field.pipeline) {
                source.hoist(variable)
                source.line(variable + ' = ' + reference)
                field.pipeline.slice().reverse().forEach(function (transform) {
                    var parameters = transform.parameters.map(function (paramaeter) {
                        return JSON.stringify(paramaeter)
                    }).concat([ 'false', 'null', variable ]).join(', ')
                    source.line(variable, ' = transforms.', transform.name, '(', parameters, ')')
                })
                source.line()
                variables[field.name] = variable
            }
        }

        pattern.forEach(unravel)

        source.consume(sizeOfSource('return ', variables, object))

        var sizeOf = ('return ' + source.define('object')).split(/\n/)

        return precompiler('sizeOf', pattern, [ 'transforms' ], sizeOf)(transforms)
    }

    function compile (pattern) {
        var object = { pattern: parse(pattern) }
        if (canCompileSizeOf(object.pattern)) {
            object.sizeOf = compileSizeOf(object)
        }
        if (canCompileSerializer(object.pattern)) {
            object.createSerializer = compileSerializer(object)
        }
        object.createParser = compileParser(object)
        return object
    }

    function packet (name, pattern) {
        packets[name] = compile(pattern)
    }

    function transform (name, procedure) {
        transforms[name] = procedure
    }

    function pattern (nameOrPattern) {
        return packets[nameOrPattern] || compile(nameOrPattern)
    }

    function createParser (context) {
        if (context) throw new Error
        return new Parser(new Definition(packets, transforms, options), options)
    }

    function createSerializer (context) {
        if (context) throw new Error
        return new Serializer(new Definition(packets, transforms, options), options)
    }

    function extend (object) {
        return classify.call(object, packet, transform, createParser, createSerializer)
    }

    // Execute the pipeline of transforms for the `pattern` on the `value`.
    function pipeline (outgoing, pattern, value, reverse) {
        var i, I, j, J, by, pipeline, parameters, transform
        // Run the pipelines for parsing.
        if (pipeline = pattern.pipeline) {
            if (reverse) {
                i = pipeline.length - 1, I = -1, by = -1
            } else {
                i = 0, I = pipeline.length; by = 1
            }
            while (i != I) {
                transform = pipeline[i]
                parameters = []
                for (j = 0, J = transform.parameters.length; j < J; j++) {
                    parameters.push(transform.parameters[j])
                }
                parameters.push(outgoing, pattern, value)
                value = transforms[transform.name].apply(null, parameters)
                i += by
            }
        }
        return value
    }

    return classify.call(this, packet, transform, pattern, pipeline, extend)
}

function Parser (definition, options) {
    options = options || {}

    function extract (nameOrPattern, callback) {
        var compiled = definition.pattern(nameOrPattern)
        var patternIndex = 0
        var pattern = compiled.pattern.slice()
        var fields = {}

        function incremental (buffer, start, end, pattern, index, object, callback) {
            this.parse = createGenericParser(options, definition, pattern, index, callback, object, true)
            return this.parse(buffer, start, end)
        }

        this.parse = compiled.createParser(incremental, null, pattern, definition.transforms, ieee754, {}, callback)
    }

    return classify.call(definition.extend(this), extract)
}

function createGenericParser (options, definition, pattern, patternIndex, callback, fields) {
    var context = options.context || this
    var increment, valueOffset, terminal, terminated, terminator, value,
    skipping, repeat, step, index, arrayed, pattern, patternIndex, fields

    // Prepare the parser for the next field in the pattern.
    function nextField ()  {
        var field = pattern[patternIndex]
        repeat = field.repeat
        index = 0
        skipping    = null
        terminated = ! field.terminator
        terminator = field.terminator && field.terminator[field.terminator.length - 1]
        if (field.arrayed && field.endianness  != 'x') arrayed = []
    }

    // Prepare the parser to parse the next value in the stream. It initializes
    // the value to a zero integer value or an array. This method accounts for
    // skipping, for skipped patterns.
    function nextValue () {
        // Get the next pattern.
        var field = pattern[patternIndex]

        // If skipping, skip over the count of bytes.
        if (field.endianness == 'x') {
            skipping  = field.bytes

        // Otherwise, create the empty value.
        } else {
            value = field.exploded ? [] : 0
        }
        var little = field.endianness == 'l'
        var bytes = field.bytes
        terminal = little ? bytes : -1
        valueOffset = little ? 0 : bytes - 1
        increment = little ? 1 : -1
    }

    nextField()
    nextValue()

    // Read from the `buffer` for the given `start` offset and `length`.
    return function (buffer, bufferOffset, bufferEnd) {
        // Initialize the loop counters. Initialize unspecified parameters with their
        // defaults.
        var bufferOffset = bufferOffset, bufferEnd = bufferEnd, bytes, bits, field
        var start = bufferOffset

        // We set the pattern to null when all the fields have been read, so while
        // there is a pattern to fill and bytes to read.
        PATTERN: while (pattern != null && bufferOffset < bufferEnd) {
            field = pattern[patternIndex]
            // If we are skipping, we advance over all the skipped bytes or to the end
            // of the current buffer.
            if (skipping != null) {
                var advance  = Math.min(skipping, bufferEnd - bufferOffset)
                var begin    = bufferOffset
                bufferOffset       += advance
                skipping   -= advance
                // If we have more bytes to skip, then break because we've consumed the
                // entire buffer.
                if (skipping) break
                else skipping = null
            } else {
                // If the pattern is exploded, the value we're populating is an array.
                if (field.exploded) {
                    for (;;) {
                        value[valueOffset] = buffer[bufferOffset]
                        bufferOffset++
                        valueOffset += increment
                        if (valueOffset == terminal) break
                        if (bufferOffset == bufferEnd) break PATTERN
                    }
                // Otherwise we're packing bytes into an unsigned integer, the most
                // common case.
                } else {
                    for (;;) {
                        value += Math.pow(256, valueOffset) * buffer[bufferOffset]
                        bufferOffset++
                        valueOffset += increment
                        if (valueOffset == terminal) break
                        if (bufferOffset == bufferEnd) break PATTERN
                    }
                }
                // Unpack the field value. Perform our basic transformations. That is,
                // convert from a byte array to a JavaScript primitive.
                //
                // Resist the urge to implement these conversions with pipelines. It
                // keeps occurring to you, but those transitions are at a higher level
                // of abstraction, primarily for operations on gathered byte arrays.
                // These transitions need to take place immediately to populate those
                // arrays.

                // By default, value is as it is.
                bytes = value

                // Convert to float or double.
                if (field.type == 'f') {
                    if (field.bits == 32)
                        value = ieee754.fromIEEE754Single(bytes.reverse())
                    else
                        value = ieee754.fromIEEE754Double(bytes.reverse())

                // Get the two's compliment signed value.
                } else if (field.signed) {
                    value = 0
                    if ((bytes[bytes.length - 1] & 0x80) == 0x80) {
                        var top = bytes.length - 1
                        for (i = 0; i < top; i++)
                            value += (~bytes[i] & 0xff) * Math.pow(256, i)
                        // To get the two's compliment as a positive value you use
                        // `~1 & 0xff == 254`. For example: `~1 == -2`.
                        value += (~(bytes[top] & 0x7f) & 0xff & 0x7f) * Math.pow(256, top)
                        value += 1
                        value *= -1
                    } else {
                        // Not really necessary, the bit about top.
                        top = bytes.length - 1
                        for (i = 0; i < top; i++)
                            value += (bytes[i] & 0xff)  * Math.pow(256, i)
                        value += (bytes[top] & 0x7f) * Math.pow(256, top)
                    }
                }
                // If the current field is arrayed, we keep track of the array we're
                // building after a pause through member variable.
                if (field.arrayed) arrayed.push(value)
            }

            // If we've not yet hit our terminator, check for the terminator. If we've
            // hit the terminator, and we do not have a maximum size to fill, then
            // terminate by setting up the array to terminate.
            //
            // A length value of the maximum number value means to repeat until the
            // terminator, but a specific length value means that the zero terminated
            // string occupies a field that has a fixed length, so we need to skip the
            // unused bytes.
            if (! terminated) {
                if (terminator == value) {
                    terminated = true
                    var t = pattern[patternIndex].terminator
                    for (i = 1, I = t.length; i <= I; i++) {
                        if (arrayed[arrayed.length - i] != t[t.length - i]) {
                            terminated = false
                            break
                        }
                    }
                    if (terminated) {
                        for (i = 0, I + t.length; i < I; i++) {
                            arrayed.pop()
                        }
                        terminated = true
                        if (repeat == Number.MAX_VALUE) {
                            repeat = index + 1
                        } else {
                            skipping = (repeat - (++index)) * field.bytes
                            if (skipping) {
                                repeat = index + 1
                                continue
                            }
                        }
                    }
                }
            }

            // If we are reading an arrayed pattern and we have not read all of the
            // array elements, we repeat the current field type.
            if (++index <  repeat) {
                nextValue()

            // Otherwise, we've got a complete field value, either a JavaScript
            // primitive or raw bytes as an array.
            } else {

                // If we're not skipping, push the field value after running it through
                // the pipeline.
                if (field.endianness != 'x') {
                    var packing

                    // If the field is a bit packed field, unpack the values and push them
                    // onto the field list.
                    if (packing = field.packing) {
                        var length  = field.bits
                        for (i = 0, I = packing.length; i < I; i++) {
                            var pack = packing[i]
                            length -= pack.bits
                            if (pack.endianness == 'b') {
                                var unpacked = Math.floor(value / Math.pow(2, length))
                                unpacked = unpacked % Math.pow(2, pack.bits)
                                // If signed, we convert from two's compliment.
                                if (pack.signed) {
                                    var mask = Math.pow(2, pack.bits - 1)
                                    if (unpacked & mask)
                                        unpacked = -(~(unpacked - 1) & (mask * 2 - 1))
                                }
                                fields[pack.name] = unpacked
                            }
                        }

                    // If the value is a length encoding, we set the repeat value for the
                    // subsequent array of values. If we have a zero length encoding, we
                    // push an empty array through the pipeline, and move on to the next
                    // field.
                    } else if (field.lengthEncoding) {
                        if ((pattern[patternIndex + 1].repeat = value) == 0) {
                            fields[pattern[patternIndex + 1].name] = definition.pipeline(true, field, [], false)
                            patternIndex++
                        }
                    // If the value is used as a switch for an alternation, we run through
                    // the different possible branches, updating the pattern with the
                    // pattern of the first branch that matches. We then re-read the bytes
                    // used to determine the conditional outcome.
                    } else if (field.alternation) {
                        // This makes no sense now.I wonder if it is called.
                        // unless field.signed
                        //  value = (Math.pow(256, i) * b for b, i in arrayed)
                        var i, I, branch
                        for (i = 0, I = field.alternation.length; i < I; i++) {
                            branch = field.alternation[i]
                            if (branch.read.minimum <= value &&
                                    value <= branch.read.maximum &&
                                    (value & branch.read.mask) == branch.read.mask)
                                break
                        }
                        if (branch.failed)
                            throw new Error('Cannot match branch.')
                        bytes = arrayed.slice(0)
                        pattern.splice.apply(pattern, [ patternIndex, 1 ].concat(branch.pattern))
                        nextField()
                        nextValue()
                        this.parse(bytes, 0, bytes.length)
                        continue


                    // Otherwise, the value is what it is, so run it through the user
                    // supplied transformation pipeline, and push it onto the list of
                    // fields.
                    } else {
                        if (field.arrayed) value = arrayed
                        fields[field.name] = definition.pipeline(true, field, value, false)
                    }
                }
                // If we have read all of the pattern fields, call the associated
                // callback.  We add the parser and the user supplied additional
                // arguments onto the callback arguments.
                //
                // The pattern is set to null, our terminal condition, because the
                // callback may specify a subsequent packet to parse.
                if (++patternIndex == pattern.length) {
                    pattern = null
                    callback.call(context, fields)
                // Otherwise we proceed to the next field in the packet pattern.
                } else {
                    nextField()
                    nextValue()
                }
            }
        }
        // Return the count of bytes read.
        return bufferOffset - start
    }
}

module.exports.Parser = Parser

// Construct a `Serializer` around the given `definition`.
function Serializer(definition, options) {
    var serializer = this
    var context = options.context || this
    var compiled, incoming

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

    function start (buffer, start) { return start }

    function serialize () {
        var shiftable = __slice.call(arguments)

        compiled = definition.pattern(shiftable.shift())

        var callback = typeof shiftable[shiftable.length - 1] == 'function' ? shiftable.pop() : start

        incoming = shiftable.shift()

        function incremental (buffer, start, end, pattern, patternIndex, object, callback) {
            this.write = createGenericWriter(pattern.slice(patternIndex), object, callback)
            return this.write(buffer, start, end)
        }

        if (canCompileSerializer(compiled.pattern)) {
            this.write = compiled.createSerializer(incremental, start, compiled.pattern, definition.transforms, ieee754, incoming, callback)
            return
        }

        this.write = createGenericWriter(compiled.pattern, incoming, callback)
    }

    function _sizeOf () {
        if (compiled.sizeOf) return compiled.sizeOf(incoming)
        var pattern = resolveAlternation(compiled.pattern, incoming)
        var patternIndex = 0
        var field = pattern[patternIndex]
        var repeat = field.repeat
        var outgoingIndex = 0
        var size = 0
        while (field) {
            if (field.terminator) {
                if (field.repeat == Number.MAX_VALUE) {
                    repeat = definition.pipeline(false, field, incoming[field.name], true).length + field.terminator.length
                } else {
                    repeat = field.repeat
                }
            } else {
                repeat = field.repeat || 1
                outgoingIndex += repeat
            }
            size += field.bytes * repeat
            field = pattern[++patternIndex]
        }
        return size
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

    function createGenericWriter (pattern, incoming, callback) {
        pattern = resolveAlternation(pattern, incoming)

        var terminal, valueOffset, increment, array, value, skipping, repeat,
        outgoing, index, terminated, terminates, pattern, padding, callback

        var patternIndex = 0

        // Prepare the parser for the next field in the pattern.
        function nextField () {
            var field  = pattern[patternIndex]
            repeat       = field.repeat
            terminated  = ! field.terminator
            terminates  = ! terminated
            index       = 0
            padding     = null

            // Can't I keep separate indexes? Do I need that zero?
            if (field.endianness ==  'x') {
                if (field.padding != null)
                    padding = field.padding
            }
        }

        // Prepare the parser to serialize the next value to the stream. It
        // initializes Initialize the next field value to serialize. In the case of an
        // arrayed value, we will use the next value in the array. This method will
        // adjust the pattern for alteration. It will pack a bit packed integer. It
        // will covert the field to a byte array for floats and signed negative
        // numbers.
        function nextValue () {
            var i, I, packing, count, length, pack, unpacked, range, mask
            var field = pattern[patternIndex]

            // If we are skipping without filling we note the count of bytes to skip,
            // otherwise we prepare our value.
            if (field.endianness ==  'x' &&  padding == null) {
                skipping = field.bytes
            } else {
                // If we're filling, we write the fill value.
                if (padding != null) {
                    value = padding

                // If the field is arrayed, we get the next value in the array.
                } else if (field.arrayed) {
                    if (index == 0) {
                        array = incoming[field.name]
                        array  = definition.pipeline(false, field, array, true)
                    }
                    value = array[index]

                // If the field is bit packed, we update the `outgoing` array of values
                // by packing zero, one or more values into a single value. We will also
                // check for bits filled with a pattern specified filler value and pack
                // that in there as well.
                } else if (packing = field.packing) {
                    count = 0, value = 0, length = field.bits
                    for (i = 0, I = packing.length; i < I; i++) {
                        pack = packing[i]
                        length -= pack.bits
                        if (pack.endianness ==  'b' || pack.padding != null) {
                            unpacked = pack.padding != null ? pack.padding : incoming[pack.name]
                            if (pack.signed) {
                                range = Math.pow(2, pack.bits - 1)
                                if (!( (-range) <= unpacked &&  unpacked <= range - 1))
                                    throw new Error('value ' + unpacked + ' will not fit in ' + pack.bits + ' bits')
                                if (unpacked < 0) {
                                    mask = range * 2 - 1
                                    unpacked = (~(- unpacked) + 1) & mask
                                }
                            }
                            value += unpacked * Math.pow(2, length)
                        }
                    }

                // If the current field is a length encoded array, then the length of the
                // current array value is the next value, otherwise, we have the simple
                // case, the value is the current value.
                } else {
                    if (field.lengthEncoding) {
                        value = incoming[pattern[patternIndex + 1].name].length
                        pattern[patternIndex + 1].repeat = value
                    } else {
                        value = incoming[field.name]
                    }
                }
                // If the array is not an unsigned integer, we might have to convert it.
                if (field.exploded) {
                    // Convert a float into its IEEE 754 representation.
                    if (field.type == 'f') {
                        if (field.bits == 32)
                            value = ieee754.toIEEE754Single(value).reverse()
                        else
                            value = ieee754.toIEEE754Double(value).reverse()

                    // Convert a signed integer into its two's compliment representation.
                    } else if (field.signed) {
                        var copy = Math.abs(value)
                        var bytes = []
                        // FIXME If the value is greater than zero, we can just change the
                        // pattern to packed.
                        for (i = 0, I = field.bytes; i < I; i++) {
                            var pow = Math.pow(256, i)
                            bytes[i] = Math.floor(copy / pow % (pow * 256))
                        }
                        if (value < 0) {
                            var carry = 1
                            for (i = 0, I = bytes.length; i < I; i++) {
                                bytes[i] = (~bytes[i] & 0xff) + carry
                                if (bytes[i] ==  256) bytes[i] = 0
                                else carry = 0
                            }
                        }
                        value = bytes
                    }
                }
                var little = field.endianness == 'l'
                var bytes = field.bytes
                terminal = little  ? bytes : -1
                valueOffset = little ? 0 : bytes - 1
                increment = little ? 1 : -1
                if (field.pipeline && !field.arrayed) {
                    value  = definition.pipeline(false, field, value, true)
                }
            }
        }

        nextField()
        nextValue()

        return function (buffer, bufferOffset, bufferEnd) {
            var start = bufferOffset

            // While there is a pattern to fill and space to write.
            PATTERN: while (pattern.length != patternIndex &&  bufferOffset < bufferEnd) {
                if (skipping) {
                    var advance     = Math.min(skipping, bufferEnd - bufferOffset)
                    bufferOffset         += advance
                    skipping      -= advance
                    if (skipping) break

                } else {
                    // If the pattern is exploded, the value we're writing is an array.
                    if (pattern[patternIndex].exploded) {
                        for (;;) {
                            buffer[bufferOffset] = value[valueOffset]
                            valueOffset += increment
                            bufferOffset++
                            if (valueOffset ==  terminal) break
                            if (bufferOffset == bufferEnd) break PATTERN
                        }
                    // Otherwise we're unpacking bytes of an unsigned integer, the most common
                    // case.
                    } else {
                        for (;;) {
                            buffer[bufferOffset] = Math.floor(value / Math.pow(256, valueOffset)) & 0xff
                            valueOffset += increment
                            bufferOffset++
                            if (valueOffset ==  terminal) break
                            if (bufferOffset ==  bufferEnd) break PATTERN
                        }
                    }
                }
                // If we have not terminated, check for the termination state change.
                // Termination will change the loop settings.
                if (terminates) {
                    if (terminated) {
                        if (repeat ==  Number.MAX_VALUE) {
                            repeat = index + 1
                        } else if (pattern[patternIndex].padding != null)  {
                            padding = pattern[patternIndex].padding
                        } else {
                            skipping = (repeat - (++index)) * pattern[patternIndex].bytes
                            if (skipping) {
                                repeat = index + 1
                                continue
                            }
                        }
                    } else {
                        // If we are at the end of the series, then we create an empty outgoing
                        // array to hold the terminator, because the outgoing series may be a
                        // buffer. We insert the terminator at next index in the outgoing array.
                        // We then set repeat to allow one more iteration before callback.
                        if (array.length == index + 1) {
                            terminated = true
                            array = []
                            var terminator = pattern[patternIndex].terminator
                            for (var i = 0, I = terminator.length; i < I; i++) {
                                array[index + 1 + i] = terminator[i]
                            }
                        }
                    }
                }
                // If we are reading an arrayed pattern and we have not read all of the
                // array elements, we repeat the current field type.
                if (++index < repeat) {
                    nextValue()

                // If we have written all of the packet fields, call the associated
                // callback with self parser.
                //
                // The pattern is set to null, our terminal condition, before the callback,
                // because the callback may specify a subsequent packet to parse.
                } else if (++patternIndex ==  pattern.length) {
                    this.write = start
                    if (callback != null) {
                        callback.call(context)
                        if (this.write !== start) {
                            return this.write(buffer, bufferStart, bufferEnd)
                        }
                    }
                } else {
                    padding = null
                    repeat      = pattern[patternIndex].repeat
                    terminated  = ! pattern[patternIndex].terminator
                    terminates  = ! terminated
                    index       = 0

                    nextField()
                    nextValue()
                }
            }

            return bufferOffset
        }
    }

    classify.call(definition.extend(this), serialize, offsetsOf, _sizeOf)
}

function createParser (options) {
    if (arguments.length > 1) throw new Error
    options = options || {}
    return new Parser(new Definition({}, transforms, options), options) }
function createSerializer (options) {
    if (arguments.length > 1) throw new Error
    options = options || {}
    return new Serializer(new Definition({}, transforms, options), options) }

classify.call(exports, createParser, createSerializer)
