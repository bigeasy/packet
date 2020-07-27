const $ = require('programmatic')
const join = require('./join')
const inliner = require('./inliner')
const _accumulator = require('./accumulator')

class Inliner {
    constructor ({ variables, packet, direction, accumulators, parameters }) {
        this.accumulators = accumulators
        this.parameters = parameters
        this.accumulated = []
        this.buffered = []
        this.variables = variables
        this.packet = packet.name
        this.direction = direction
        this.$$ = -1
        this.stack = []
    }

    accumulations (functions, seen = {}) {
        const invocations = this.buffered.filter(accumulator => {
            return accumulator.properties.some(property => {
                return this.accumulator[property] != null && !seen[property]
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

    accumulator (field, filter = () => true) {
        const accumulators = field.accumulators.filter(accumulator => filter(accumulator.name))
        if (accumulators.length == 0) {
            return null
        }
        return _accumulator(this, this.accumulators, this.parameters, accumulators)
    }

    _properties (path) {
        // Collection of function properties.
        const is = {
            transform: false,
            buffered: false,
            assertion: false
        }
        const properties = {}, name = path.split('.').pop()
        let type = 'transform'
        for (const property of inline.properties) {
            if (property == '$_' || property == name) {
                if (inline.defaulted.includes(property)) {
                    is.assertion = true
                }
                is.transform = true
                properties[property] = $_
            } else if (property == '$direction') {
                properties[property] = util.inspect(this.direction)
            } else if (property == '$i') {
                properties[property] = this.variables.i ? property : '[]'
            } else if (property == '$path') {
                properties[property] = util.inspect(path.split('.'))
            } else if (property == this.packet || property == '$') {
                properties[property] = this.packet
            } else if (this.accumulator[property]) {
                properties[property] = `$accumulator[${util.inspect(property)}]`
            } else if (property == '$buffer') {
                is.buffered = true
                properties[property] = property
            } else if (property == '$start') {
                is.buffered = true
                properties[property] = `$starts[${this.buffered.length}]`
            } else if (property == '$end') {
                is.buffered = true
                properties[property] = '$start'
            }
        }
        return {
            is: is,
            properties: Object.keys(properties).map(property => {
                return `${property}: ${properties[property]}`
            }).join('\n')
        }
    }

    test (path, test, signature = []) {
        if (test.properties.length == 0) {
            const sliced = signature.concat([ this.packet ]).slice(0, test.arity)
            return $(`
                (`, test.source, `)(${sliced.join(', ')})
            `)
        }
        const { properties } = this._properties()
        return $(`
            (`, inline.source, `)(`, properties, `)
        `)
    }

    _inline ({ path, inlines, signature = null, assignee = null }) {
        const inlined = [], accumulators = {}
        // Array of functions that operate on the underlying buffer.
        const buffered = { offset: accumulate.buffered.length, length: 0 }
        // For each function defined by an inline, always one function for a select
        // or conditional test.
        for (const inline of inlines) {
            // Read the initial register definition.
            const $_ = registers[0]
            // Positional arguments are simplified, less analysis because special
            // features are indicated by named functions.
            if (inline.properties.length == 0) {
                if (inline.defaulted[0] == 0) {
                    is.assertion = true
                }
                if (is.assertion) {
                    inlined.push(`; (${inline.source})(${$_})`)
                } else {
                    if (registers.length != 1) {
                        registers.shift()
                    }
                    // TODO I documented other possible parameters.
                    inlined.push(`${assignee} = (${inline.source})(${$_})`)
                }
            } else {
                const { is, properties } = this._properties(path)
                if (is.buffered) {
                    if (is.transform) {
                        throw new Error
                    } else {
                        accumulate.buffered.push({
                            start: accumulate.buffered.length,
                            properties: inline.properties,
                            source: `; (${inline.source})(` + $(`
                                {
                                    `, body.join(',\n'), `
                                })
                            `)
                        })
                    }
                } else if (is.assertion) {
                    inlined.push(`; (${inline.source})(` + $(`
                        {
                            `, body.join(',\n'), `
                        })
                    `))
                } else {
                    if (registers.length != 1) {
                        registers.shift()
                    }
                    inlined.push(`${assignee} = (${inline.source})(` + $(`
                        {
                            `, body.join(',\n'), `
                        })
                    `))
                }
            }
        }
        buffered.length = accumulate.buffered.length
        return { inlined, buffered, register: registers[0] }
    }

    inline_ (path, inlines) {
        if (inlines.length == 0) {
            this.stack.push({ offset: 0, length: 0 })
            return { path: path, inlined: null, starts: null }
        }
        const registers = this.direction == 'serialize' ? [ path, `$$[${++this.$$}]` ] : [ path ]
        const assign = registers[registers.length - 1]
        const inline = this.inline(path, inlines, registers, assign)
        const starts = []
        for (let i = inline.buffered.offset, I = inline.buffered.length; i < I; i++) {
            starts.push(`$starts[${i}] = $start`)
        }
        this.stack.push({ ...inline.buffered })
        return {
            path: inline.register,
            inlined: inline.inlined.length != 0 ? join(inline.inlined) : null,
            starts: starts.length != 0 ? starts.join('\n') : null,
        }
    }

    inline (path, inlines, registers, assignee = null) {
        return inliner(this, path, inlines, registers, assignee)
    }

    exit () {
        return this.buffered.length != 0
            ? this.buffered.map(buffered => buffered.source).join('\n')
            : null
    }

    pop () {
        const popped = this.stack.pop()
        if (this.direction == 'serialize') {
            this.$$--
        }
        const buffered = this.buffered
            .splice(popped.offset, popped.length)
            .map(buffered => buffered.source)
        return buffered.length != 0 ? buffered.join('\n') : null
    }
}

module.exports = Inliner
