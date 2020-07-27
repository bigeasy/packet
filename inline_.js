// Node.js API.
const util = require('util')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Join an array of strings separated by an empty line.
const join = require('./join')

module.exports = function ({ variables, packet, direction, accumulators, parameters }) {
    // TODO Just use the scope.
    const accumulate = {
        accumulators: accumulators,
        parameters: parameters,
        variables: variables,
        accumulated: {},
        buffered: [],
        packet: packet.name,
        direction: direction,
        $$: -1,
        stack: [],
        accumulations: accumulations,
        accumulator: accumulator,
        test: test,
        inline_: inline_,
        exit: exit,
        pop: pop
    }

    function accumulations (functions, seen = {}) {
        const invocations = this.buffered.filter(accumulator => {
            return accumulator.properties.some(property => {
                return this.accumulated[property] != null && !seen[property]
            })
        })
        for (const invocation of invocations) {
            for (const property of invocation.properties) {
                seen[property] = true
            }
        }
        return invocations.length != 0
            ? invocations.map(invocation => {
                return $(`
                    `, invocation.source, `
                    $starts[${invocation.start}] = $start
                `)
            }).join('\n')
            : null
        return invocations.length != 0 ? invocations.join('\n') : null
    }

    function accumulator (field, filter = () => true) {
        const filtered = field.accumulators.filter(accumulator => filter(accumulator.name))
        return filtered.length != 0 ? filtered.map(accumulator => {
            const { name, source } = accumulator
            accumulate.accumulated[name] = []
            if (accumulator.type == 'function' && parameters[name] == null) {
                return `$accumulator[${util.inspect(name)}] = (${accumulators[name]})()`
            } else {
                return `$accumulator[${util.inspect(name)}] = ${accumulators[name]}`
            }
        }).join('\n') : null
    }

    function _properties (path, source, $_) {
        // Collection of function properties.
        const is = {
            transform: false,
            buffered: false,
            assertion: false
        }
        const properties = {}, name = path.split('.').pop()
        let type = 'transform'
        for (const property of source.properties) {
            if (property == '$_' || property == name) {
                if (source.defaulted.includes(property)) {
                    is.assertion = true
                }
                is.transform = true
                properties[property] = $_
            } else if (property == '$direction') {
                properties[property] = util.inspect(accumulate.direction)
            } else if (property == '$i') {
                properties[property] = variables.i ? property : '[]'
            } else if (property == '$path') {
                properties[property] = util.inspect(path.split('.'))
            } else if (property == accumulate.packet || property == '$') {
                properties[property] = accumulate.packet
            } else if (accumulate.accumulated[property]) {
                properties[property] = `$accumulator[${util.inspect(property)}]`
            } else if (property == '$buffer') {
                is.buffered = true
                properties[property] = property
            } else if (property == '$start') {
                is.buffered = true
                properties[property] = `$starts[${accumulate.buffered.length}]`
            } else if (property == '$end') {
                is.buffered = true
                properties[property] = '$start'
            }
        }
        return {
            is: is,
            properties: $(`
                {
                    `, Object.keys(properties).map(property => {
                        return `${property}: ${properties[property]}`
                    }).join(',\n'), `
                }
            `)
        }
    }

    function test (path, test, signature = []) {
        if (test.properties.length == 0) {
            const sliced = signature.concat([ accumulate.packet ]).slice(0, test.arity)
            return $(`
                (`, test.source, `)(${sliced.join(', ')})
            `)
        }
        const { properties } = _properties(path, test, null)
        return $(`
            (`, test.source, `)(`, properties, `)
        `)
    }
    //

    // Generate one or more inline user defined functions. We need to generate
    // functions with both positional and named arguments, lookup up those
    // arguments in the context supplied by the generator.

    //
    function inline_ (path, inlines) {
        if (inlines.length == 0) {
            accumulate.stack.push({ offset: 0, length: 0 })
            return { path: path, inlined: null, starts: null }
        }
        const registers = accumulate.direction == 'serialize'
            ? [ path, `$$[${++accumulate.$$}]` ]
            : [ path ]
        // Array of functions that operate on the underlying buffer.
        const offset = accumulate.buffered.length
        const assignee = registers[registers.length - 1]
        const inlined = []
        // For each function defined by an inline.
        for (const inline of inlines) {
            // Read the initial register definition.
            const $_ = registers[0]
            // Positional arguments are simplified, less analysis because special
            // features are indicated by named functions.
            if (inline.properties.length == 0) {
                if (inline.defaulted[0] == 0) {
                    inlined.push($(`
                        ; (`, inline.source, `)(${$_})
                    `))
                } else {
                    if (registers.length != 1) {
                        registers.shift()
                    }
                    inlined.push($(`
                        ${assignee} = (`, inline.source, `)(${$_})
                    `))
                }
            } else {
                const { properties, is } = _properties(path, inline, $_)
                if (is.buffered) {
                    if (is.transform) {
                        throw new Error
                    } else {
                        accumulate.buffered.push({
                            start: accumulate.buffered.length,
                            properties: inline.properties,
                            source: $(`
                                ; (`, inline.source, `)(`, properties, `)
                            `)
                        })
                    }
                } else {
                    if (is.assertion) {
                        inlined.push($(`
                            ; (`, inline.source, `)(`, properties, `)
                        `))
                    } else {
                        if (registers.length != 1) {
                            registers.shift()
                        }
                        inlined.push($(`
                            ${assignee} = (`, inline.source, `)(`, properties, `)
                        `))
                    }
                }
            }
        }
        const entry = { offset: offset, length: accumulate.buffered.length - offset }
        const starts = []
        for (let i = entry.offset, I = entry.offset + entry.length; i < I; i++) {
            starts.push(`$starts[${i}] = $start`)
        }
        accumulate.stack.push(entry)
        return {
            path: registers[0],
            inlined: inlined.length != 0 ? join(inlined) : null,
            starts: starts.length != 0 ? starts.join('\n') : null,
        }
    }

    function exit () {
        return accumulate.buffered.length != 0
            ? accumulate.buffered.map(buffered => buffered.source).join('\n')
            : null
    }

    function pop () {
        const popped = accumulate.stack.pop()
        if (accumulate.direction == 'serialize') {
            accumulate.$$--
        }
        const buffered = accumulate.buffered
            .splice(popped.offset, popped.length)
            .map(buffered => buffered.source)
        return buffered.length != 0 ? buffered.join('\n') : null
    }

    return accumulate
}
