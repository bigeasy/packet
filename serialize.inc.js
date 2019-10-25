var Variables = require('./variables')
var explode = require('./explode')
var qualify = require('./qualify')
var $ = require('programmatic')
var joinSources = require('./join-sources')

function Generator () {
    this.step = 0
    this.variables = new Variables
}

Generator.prototype.integer = function (field, property) {
    var step = this.step, bites = [], bite = field.bite, stop = field.stop, shift
    while (bite != stop) {
        var value = bite ? 'value >>> ' + bite * 8 : 'value'
        bites.push('buffer[start++] = ' + value + ' & 0xff')
        bite += field.direction
    }
    bites = bites.join('\n')
    var direction = field.little ? '++' : '--'
    var source = $(`
        case ${this.step++}:

            this.step = ${this.step}
            this.bite = ${field.bite}

        case ${this.step++}:

            while (this.bite != ${field.stop}) {
                if (start == end) {
                    return { start: start, serializer: this }
                }
                buffer[start++] = ${property} >>> this.bite * 8 & 0xff
                this.bite${direction}
            }

    `)
    return { step: step, source: source }
}

Generator.prototype.construct = function (definition) {
    var fields = []
    for (var name in definition) {
        if (name[0] === '$') {
            continue
        }
        var field = definition[name]
        if (Array.isArray(field)) {
            fields.push(name + ': new Array')
        } else {
            fields.push(name + ': null')
        }
    }
    return fields.join(',\n')
}

Generator.prototype.lengthEncoded = function (packet) {
    var source = ''
    this.forever = true
    var step = this.step
    var again = this.step + 2
    source = $(`
        `, this.integer(packet.length, 'frame.object.' + packet.name + '.length').source, `

            this.step = ${again}

        case ${this.step++}:

            this.stack.push(frame = {
                object: frame.object.${packet.name}[frame.index],
                index: 0
            })
            this.step = ${this.step}

        `, this.field(packet.element), `

            this.stack.pop()
            frame = this.stack[this.stack.length - 1]
            if (++frame.index != frame.object.${packet.name}.length) {
                this.step = ${again}
                continue
            }
    `)
    return { step: step, source: source }
}

Generator.prototype.field = function (packet) {
    switch (packet.type) {
    case 'structure':
        return joinSources(packet.fields.map(function (packet) {
            var source = this.field(packet).source
            return $(`
                `, source, `
                    this.step = ${this.step}
            `)
        }.bind(this)))
    case 'lengthEncoded':
        return this.lengthEncoded(packet)
    default:
        var field = packet
        if (field.type === 'integer')  {
            return this.integer(field, 'frame.object.' + packet.name)
        }
    }
}

Generator.prototype.serializer = function (packet) {
    var source = this.field(packet)
    var dispatch = $(`
        switch (this.step) {
        `, source, `

        case ${this.step}:

            break${this.forever ? ' SERIALIZE' : ''}

        }
    `)
    if (this.forever) {
        dispatch = $(`
            SERIALIZE: for (;;) {
                `, dispatch, `
            }
        `)
    }
    var object = 'serializers.inc.' + packet.name
    return $(`
        ${object} = function (object) {
            this.step = 0
            this.bite = 0
            this.stop = 0
            this.stack = [{
                object: object,
                index: 0,
                length: 0
            }]
        }

        ${object}.prototype.serialize = function (buffer, start, end) {
            var frame = this.stack[this.stack.length - 1]

            `, dispatch, `

            return { start: start, serializer: null }
        }
    `)
}

module.exports = function (compiler, definition) {
    var source = joinSources(definition.map(function (packet) {
        return new Generator().serializer(explode(packet))
    }))
    return compiler(source)
}
