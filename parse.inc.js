var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var joinSources = require('./join-sources')
var unpackAll = require('./unpack')
var $ = require('programmatic')

function Generator () {
    this.step = 0
    this.variables = new Variables
}

function when (condition, source) {
    return condition ? source : ''
}

Generator.prototype.integer = function (field, property, cached) {
    var read = [], bite = field.bite, stop = field.stop, step = this.step
    while (bite != stop) {
        read.unshift('buffer[start++]')
        if (bite) {
            read[0] += ' * 0x' + Math.pow(256, bite).toString(16)
        }
        bite += field.direction
    }
    if (cached) {
        this.cached = true
    }
    read = read.reverse().join(' + \n')
    var direction = field.little ? '++' : '--'
    var assignment
    if (field.fields) {
        this.variables.hoist('object')
        this.variables.hoist('value')
        assignment = $(`
            value = frame.value

            `, unpackAll('this.stack[this.stack.length - 1].' + property, field), `
        `)
    } else {
        assignment = $(`
            this.stack[this.stack.length - 1].${property} = frame.value
        `)
    }
    var source = $(`
        case ${this.step++}:

            ${when(cached, 'this.cache = []')}
            this.stack.push({
                value: 0,
                bite: ${field.bite}
            })
            this.step = ${this.step}

        case ${this.step++}:

            frame = this.stack[this.stack.length - 1]

            while (frame.bite != ${stop}) {
                if (start == end) {
                    return { start: start, object: null, parser: this }
                }
                ${when(cached, 'this.cache.push(buffer[start])')}
                frame.value += Math.pow(256, frame.bite) * buffer[start++]
                frame.bite${direction}
            }

            this.stack.pop()

            `, assignment, `

    `)
    return {
        step: step,
        source: source
    }
}

Generator.prototype.construct = function (packet) {
    var fields = []
    // TODO Not always a structure, sometimes it is an object.
    if (packet.type == 'structure') {
        packet.fields.forEach(function (packet) {
            switch (packet.type) {
            case 'integer':
                if (packet.name) {
                    fields.push(packet.name + ': null')
                } else if (packet.fields) {
                    packet.fields.forEach(function (packet) {
                        fields.push(packet.name + ': null')
                    })
                }
                break
            case 'lengthEncoded':
                fields.push(packet.name + ': new Array')
                break
            }
        }, this)
    } else {
        throw new Error('to do')
    }
    return fields.join(',\n')
}

Generator.prototype.condition = function (packet, depth) {
    var step = this.step
    this.forever = true
    this.variables.hoist('object')
    var choices = packet.conditions.map(function (condition, index) {
        var test = condition.test
        var choice = { fields: condition.fields, test: condition.test }
        choice.condition = '} else {'
        if (choice.test) {
            if (index === 0) {
                choice.condition = 'if (' + test + ') {'
            } else {
                choice.condition = '} else if (' + test + ') {'
            }
        }
        return choice
    })
    var sources = [], dispatch = '', step
    choices.forEach(function (choice) {
        var source = ''
        var step = this.stop
        // TODO Make this some sort of block type.
        choice.fields.forEach(function (packet) {
            var got = this.field(explode(packet))
            step = got.step
            source = $(`
                `, got.source, `
            `)
        }, this)
        dispatch = $(`
            `, dispatch, `
            `, choice.condition, `

                this.step = ${step}
                continue

        `)
        sources.push(source)
    }, this)
    var steps = ''
    sources.forEach(function (source) {
        steps = $(`
            `, steps, `
            `, source, `
                this.step = ${this.step}
                continue

        `)
    }, this)
    var source = $(`
            frame = this.stack[this.stack.length - 1]
            object = this.stack[0].object

            `, dispatch, `
            }

        `, steps, `
    `)
    return {
        step: step,
        source: source
    }
}

Generator.prototype.lengthEncoded = function (packet, depth) {
    var source = ''
    this.forever = true
    var integer = this.integer(packet.length, 'length')
    var again = this.step
    source = $(`
        `, integer.source, `

            this.stack[this.stack.length - 1].index = 0
        `, this.field(packet.element, depth, true).source, `

            frame = this.stack[this.stack.length - 2]
            frame.object.${packet.name}.push(this.stack.pop().object)
            if (++frame.index != frame.length) {
                this.step = ${again}
                continue
            }
            this.step = ${this.step}

    `)
    return {
        step: integer.step,
        source: source
    }
}

Generator.prototype.field = function (packet, depth, arrayed) {
    switch (packet.type) {
    case 'structure':
        var assignment = arrayed ? ''
            : 'this.stack[this.stack.length - 2].object.' + packet.name +
                    ' = this.stack[this.stack.length - 1].object'
        var push = $(`
            case ${this.step++}:

                this.stack.push({
                    object: {
                        `, this.construct(packet, 0), `
                    }
                })
                `, assignment, `
                this.step = ${this.step}

        `)
        var source =  joinSources(packet.fields.map(function (packet) {
            return this.field(packet, 0).source
        }.bind(this)))
        return {
            source: $(`
                `, push, `
                `, source, `
            `)
        }
    case 'condition':
        return this.condition(packet)
    case 'lengthEncoded':
        return this.lengthEncoded(packet)
    default:
        var object = 'object'
        if (packet.type === 'integer')  {
            return this.integer(packet, packet.fields ? object : object + '.' + packet.name)
        }
    }
}

Generator.prototype.parser = function (packet) {
    var source = this.field(packet, 0).source
    var dispatch = $(`
        switch (this.step) {
        `, source, `
        case ${this.step}:

            return {
                start: start,
                object: this.stack[0].object.object,
                parser: null
            }

        }
    `)
    if (this.forever) {
        dispatch = $(`
            for (;;) {

                `, dispatch, `

                break
            }
        `)
    }
    var object = 'parsers.inc.' + packet.name
    return $(`
        ${object} = function () {
            this.step = 0
            this.stack = [{
                object: { object: null }
            }]
            ${when(this.cached, 'this.cache = null')}
        }

        ${object}.prototype.parse = function (buffer, start, end) {
            `, String(this.variables), `
            var frame = this.stack[this.stack.length - 1]

            `, dispatch, `
        }
    `)
}

module.exports = function (compiler, definition) {
    var source = joinSources(definition.map(function (packet) {
        return new Generator().parser(explode(packet))
    }))
    source = $(`
        `, source, `
    `)
    return compiler(source)
}
