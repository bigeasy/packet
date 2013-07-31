var parse = require('./tokenizer').parse,
        ieee754   = require('./ieee754'),
        util = require('util'),
        __slice = [].slice

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

Source.prototype.indent = function () {
    this._indent++
}

Source.prototype.dedent = function () {
    this._indent--
}

Source.prototype._indentation = function () {
    return new Array(this._indent + 1).join('  ')
}

Source.prototype.line = function () {
    var line = __slice.call(arguments).join('')
    if (line.length) this._lines.push(this._indentation() + line)
    else this._lines.push('')
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
    }.bind(this))
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
    }.bind(this))
}

Source.prototype.replace = function () {
    var last = this._lines[this._lines.length - 1]
    last = last.replace.apply(last, __slice.call(arguments))
    this._lines[this._lines.length - 1] = last
}

Source.prototype.define = function () {
    var source = new Source
    source.line('function (', __slice.call(arguments).join(', '), ') {')
    source.indent()
    if (this._hoisted.length) {
        source.line('var ', this._hoisted.join(', '), ';')
        source.line()
    }
    source.consume(this)
    source.dedent()
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

function Definition (packets, transforms, options) {
    packets = Object.create(packets)
    this.transforms = transforms = Object.create(transforms)
    options = options || {}
    if (!('compile' in options)) options.compile = true

    var precompiler = options.precompiler || function (pattern, source) {
        return Function.call(Function,
            'incremental', 'pattern', 'transforms', 'ieee754', 'callback', source.join('\n'))
    }

    function precompile (pattern) {
        if (!options.compile) return

        function unsigned (source, variable, field, increment) {
            var little = field.endianness == 'l',
                    bytes = field.bytes,
                    bite = little ? 0 : bytes - 1,
                    direction = little ? 1 : -1,
                    stop = little ? bytes : -1,
                    line = new Source,
                    assign
            var sign = '0x80' + new Array(field.bytes).join('00')
            var mask = '0xff' + new Array(field.bytes).join('ff')
            if (field.signed) {
                source.hoist('value')
                source.line('value =')
                assign = true
            } else {
                source.line(variable)
            }
            source.indent()
            while (bite != stop) {
                if (increment) {
                    line.line('buffer[start++]')
                } else {
                    line.line('buffer[start + ', offset++, ']')
                }
                line.text(' * ' + Math.pow(256, bite) + ' +')
                line.replace(/ \* 1 \+$/, ' +')
                line.replace(/start \+ 0/, 'start')
                if (bytes == 1) {
                    source.consume(' ', line)
                } else {
                    source.consume(line)
                }
                bite += direction
            }
            source.replace(/ \+$/, ';')
            source.dedent()
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
            } else {
                gather.line('value = new Array(' + bytes + ');')
                while (bite != stop) {
                    line = 'value[' + bite + '] = buffer[start + ' + (offset++)  + '];'
                    line = line.replace(/start \+ 0/, 'start')
                    gather.line(line)
                    bite += direction
                }
                source.consume(gather)
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

        method.hoist('object = {}')

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
                        method.indent()
                        section.line('start += ', sum + ';')
                        doRangeCheck()
                        sums.pop()
                        method.dedent()
                        offset = was
                    } else if (read.minimum == read.maximum) {
                        cond.line(ai ? '} else ' : '', 'if ')
                        cond.text('(', read.minimum, ' == value) {')
                        method.consume(cond)
                        var was = offset
                        // TODO: It will only do one, then the offsets will be off!
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        alternate.pattern.forEach(unravel)
                        method.indent()
                        section.line('start += ', sum + ';')
                        doRangeCheck()
                        sums.pop()
                        method.dedent()
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
                        method.indent()
                        section.line('start += ', sum + ';')
                        doRangeCheck()
                        sums.pop()
                        method.dedent()
                        offset = was
                            }
                        }
                    } else {
                        cond.line(ai ? '} else ' : '', 'if ')
                        cond.text('(', read.minimum, ' <= value && value <= ', read.maximum, ') {')
                        method.consume(cond)
                        section.line('pattern.splice.apply(pattern, [', patternIndex, ', 1].concat(pattern[', patternIndex, '].alternation[', ai, '].pattern));')
                        section.indent()
                        var was = offset
                        section.line('start += ', sum + ';')
                        alternate.pattern.forEach(unravel)
                        section.line('start += ', sum + ';')
                        doRangeCheck()
                        sums.pop()
                        offset = was
                        section.dedent()
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
                        if (field.repeat != Number.MAX_VALUE) {
                            section.line('  if (array.length == ' + field.repeat + ') break;')
                        }
                        section.indent()
                        if (field.bytes == 1) {
                            section.consume(rangeCheck('start == end', 'second', patternIndex))
                        } else {
                            section.consume(rangeCheck('start + ' + (field.bytes - 1) + ' >= end', 'second', patternIndex))
                        }
                        element(section, 'value =', field)
                        section.line('start += ' + field.bytes + ';')
                        section.line('if (value == ' + field.terminator[0] + ') break;')
                        section.line('array.push(value);')
                        section.dedent()
                        section.line('}')
                    } else {
                        section.line('for (;;) {')
                        section.indent()
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
                            start += ' + field.bytes + ';                                                 \n\
                            array.push(value);                                                            \n\
                            if (' + condition + ') {                                                      \n\
                                array.splice(-' + field.terminator.length + ');                             \n\
                                break;                                                                      \n\
                            }                                                                             \n\
                        ')
                        section.dedent()
                        section.line('}')
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

        if (sum) {
            var range = rangeCheck('end - start < ' + sum, 'start', patternIndex)
            method.consume(range)
            method.consume(section)
            sums.push(sum)
            sum = 0
        } else {
            method.consume(section)
        }

        if (sums.length) {
            length.push(sums.reduce(function (sum, value) { return sum + value }, 0))
        }

        var substart = length.slice()
        if (~length.indexOf('(start - first)')) substart.unshift('first')


        method.block('                                                                              \n\
            this.length = ' + length.join(' + ') + ';                                                 \n\
                                                                                                                                                                                                \n\
            this.parse = null                                                                         \n\
                                                                                                                                                                                                \n\
            callback(object);                                                                         \n\
                                                                                                                                                                                                \n\
            if (this.parse) {                                                                         \n\
                return ' + length.join(' + ') + ' + this.parse(buffer, ' + substart.join(' + ') + ', end);\n\
            } else {                                                                                  \n\
                return ' + length.join(' + ') + ';                                                      \n\
            }                                                                                         \n\
        ')

        var parser = ('return ' + method.define('buffer', 'start', 'end')).split(/\n/)
        parser.pop()

        pattern.builder = precompiler(pattern, parser)
    }

    function compile (pattern) {
        var parsed = parse(pattern)
        parsed.hasAlternation = parsed.some(function (field) { return field.alternation })
        precompile(parsed)
        return parsed
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

//#### Parser

// Construct a `Parser` around the given `definition`.
function Parser (definition, options) {
    var increment, valueOffset, terminal, terminated, terminator, value,
    skipping, repeat, step, index, arrayed,
    pattern, patternIndex, context = options.context || this, fields, _callback

    options = (options || { directory: './t/generated'})

    // Sets the next packet to extract from the stream by providing a packet name
    // defined by the `packet` function or else a packet pattern to parse. The
    // `callback` will be invoked when the packet has been extracted from the
    // buffer or buffers given to `parse`.

    //
    function extract (nameOrPattern, callback) {
        var _pattern = definition.pattern(nameOrPattern), named
        patternIndex = 0
        _callback = callback
        pattern = _pattern.slice()
        fields = {}
        this.length = 0

        // At one point, you thought you could have  a test for the arity of the
        // function, and if it was greater than `1`, you'd call the callback
        // positionally, regardless of named parameters. Then you realized that the
        // `=>` operator in CoffeeScript would use a bind function with no
        // arguments, and read the argument array. If you do decide to go back to
        // arity override, then greater than one is the trigger. However, on
        // reflection, I don't see that the flexibility is useful, and I do believe
        // that it will generate at least one bug report that will take a lot of
        // hashing out only to close with "oh, no, you hit upon a 'hidden feature'."
        function isNamed (field) {
            return field.named || (field.packing && field.packing.some(isNamed))
                                                  || (field.alternation && field.alternation.some(function (alternate) {
                                                                return !alternate.failed && alternate.pattern.some(isNamed)
                                                            }))
        }
        named = pattern.some(isNamed)

        function incremental (buffer, start, end, pattern, index, object, callback) {
            this.parse = createGenericParser(options, definition, pattern, index, callback, object, true)
            return this.parse(buffer, start, end)
        }

        if (named) {
            var __callback = callback
        } else {
            var __callback = function (object) {
                var array = []
                flatten(pattern, object, array)
                callback.apply(this, array)
            }
        }

        if (_pattern.builder) {
            this.parse = _pattern.builder(incremental, pattern, definition.transforms, ieee754, __callback)
        } else {
            this.parse = createGenericParser(options, definition, pattern, 0, __callback, {}, true)
        }
    }

    return classify.call(definition.extend(this), extract)
}

function createGenericParser (options, definition, pattern, patternIndex, _callback, fields) {
    var increment, valueOffset, terminal, terminated, terminator, value,
    skipping, repeat, step, index, arrayed,
    pattern, patternIndex, context = options.context || this, fields, _callback
    //#### parser.parse(buffer[, start][, length])
    // The `parse` method reads from the buffer, returning when the current pattern
    // is read, or the end of the buffer is reached.

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
                this.length  += advance
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
                        this.length++
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
                        this.length++
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
                        this.length -= bytes.length
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
                    this.parse = null
                      _callback.call(context, fields)
                    if (this.parse) {
                        bufferOffset += this.parse(buffer, bufferOffset, bufferEnd)
                    }
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

function flatten (pattern, fields, array) {
    pattern.forEach(function (field) {
        if (field.packing) {
            flatten(field.packing, fields, array)
        } else if (!field.lengthEncoding && field.endianness != 'x') {
            array.push(fields[field.name])
        }
    })
}
module.exports.Parser = Parser

// Construct a `Serializer` around the given `definition`.
function Serializer(definition, options) {
    var serializer = this, terminal, valueOffset, increment, array, value, bytesWritten = 0,
    skipping, repeat, outgoing, index, terminated, terminates, pattern,
    incoming, named,
    patternIndex, context = options.context || this, padding, _callback

    function _length () { return bytesWritten }

//  function reset () { bytesWritten = 0 }

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

    function serialize () {
        // TODO: We're copying because of positional parameters and alternation.
        var shiftable = __slice.call(arguments),
                // TODO: Rename `_pattern`.
                prototype = definition.pattern(shiftable.shift()),
                callback = typeof shiftable[shiftable.length - 1] == 'function' ? shiftable.pop() : void(0),
                skip = 0,
                field, value, alternate, i, I, j, J, k, K, alternates

        // TODO: Hate that all this has to pass for the common case.
        named = (shiftable.length ==  1
                          && typeof shiftable[0] ==  'object'
                          && ! (shiftable[0] instanceof Array))

        _callback = callback
        patternIndex = 0
        alternates = prototype.slice()
        bytesWritten = 0

        // Positial arrays go through once to resolve alternation for the sake of
        // the naming. This duplication is the price you pay for invoking with
        // positional arrays, it can't be avoided.
        if (!named) {
            incoming = {}, pattern = []
            for (var i = 0; i < alternates.length; i++) {
                field = alternates[i]
                if (field.alternation) {
                    field = field.alternation[0]
                    if (field.pattern[0].packing) {
                        field = field.pattern[0].packing[0]
                    }
                    value = shiftable[0]

                    field = alternates[i]
                    for (j = 0, J = field.alternation.length; j < J; j++) {
                        alternate = field.alternation[j]
                        if (alternate.write.minimum <= value &&  value <= alternate.write.maximum) {
                            break
                        }
                    }

                    alternates.splice.apply(alternates, [ i--, 1 ].concat(alternate.pattern))
                    continue
                }

                pattern.push(field)

                if (field.packing) {
                    for (j = 0, J = field.packing.length; j < J; j++) {
                        if (field.packing[j].endianness != 'x') {
                            incoming[field.packing[j].name] = shiftable.shift()
                        }
                    }
                } else if (!field.lengthEncoding && field.endianness != 'x') {
                    incoming[field.name] = shiftable.shift()
                }
            }
            // Reset for below.
            alternates = pattern, pattern = []
        } else {
            incoming = shiftable.shift()
        }

        outgoing = {}, pattern = []

        // Determine alternation now, creating a pattern with the alternation
        // resolved.
        if (prototype.hasAlternation) {
            for (i = 0; i < alternates.length; i++) {
                field = alternates[i]
                // The name of value to test for alternation is either the first name in
                // the alternation or else if the first value is bit packed, the first
                // name in the packed alternates.
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
                    value = incoming[field.name]

                    field = alternates[i]
                    for (j = 0, J = field.alternation.length; j < J; j++) {
                        alternate = field.alternation[j]
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
                pattern.push(field)
            }
        } else {
            pattern = alternates
        }

        nextField()
        nextValue()
    }

    // Return the count of bytes that will be written by the serializer for the
    // current pattern and variables.
    function _sizeOf () {
        var patternIndex = 0, field = pattern[patternIndex], repeat = field.repeat,
                outgoingIndex = 0, size = 0
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
        var patternIndex = 0, field = pattern[patternIndex],
                output, offset = offset == null ? 0 : offset, record

        function dump (record) {
            if (buffer) {
                record.hex = buffer.slice(record.offset, record.offset + record.length).toString('hex')
            }
        }

        function detokenize (arrayed, count) {
              var scalar = (field.signed && field.type != 'f' ? '-' : '') +
                                          field.endianness +
                                          field.bits +
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
            var value = field.arrayed ? incoming[field.name][index] : incoming[field.name],
                    record =  { name: field.name,
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
                console.log(element)
                var record = { name: element.name, value: [], offset: 0 }
                if (!element.named) delete record.name
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
                if (!field.named) delete record.name
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
                if (!field.named) delete record.name
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

    //#### serializer.write(buffer[, start][, length])

    // The `write` method writes to the buffer, returning when the current pattern
    // is written, or the end of the buffer is reached.  Write to the `buffer` in
    // the region defined by the given `start` offset and `length`.
    function write (buffer, bufferOffset, bufferEnd) {
        var start = bufferOffset

        // While there is a pattern to fill and space to write.
        PATTERN: while (pattern.length != patternIndex &&  bufferOffset < bufferEnd) {
            if (skipping) {
                var advance     = Math.min(skipping, bufferEnd - bufferOffset)
                bufferOffset         += advance
                skipping      -= advance
                bytesWritten  += advance
                if (skipping) break

            } else {
                // If the pattern is exploded, the value we're writing is an array.
                if (pattern[patternIndex].exploded) {
                    for (;;) {
                        buffer[bufferOffset] = value[valueOffset]
                        valueOffset += increment
                        bytesWritten++
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
                        bytesWritten++
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
                if (_callback != null) {
                    _callback.call(context, serializer)
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

        return bufferOffset - start
    }

    classify.call(definition.extend(this), serialize, write, offsetsOf, _length, _sizeOf)
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
