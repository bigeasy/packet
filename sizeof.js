// Node.js API.
const util = require('util')

const map = require('./map')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

// Join an array of strings separated by an empty line.
const join = require('./join')

// Join an array of strings with first line of subsequent element catenated to
// last line of previous element.
const snuggle = require('./snuggle')

//

// Generate sizeof function for a given packet definition.

//
function generate (packet, { require = null }) {
    const variables = {
        register: true
    }
    const accumulate = {
        accumulator: {},
        accumulated: [],
        buffered: [],
        start: 0,
        variables: variables,
        packet: packet.name,
        direction: 'serialize'
    }

    let $i = -1

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'conditional': {
                const accumulators = {}
                field.serialize.conditions.forEach(condition => {
                    if (condition.test == null) {
                        return
                    }
                    condition.test.properties.forEach(property => {
                        if (referenced[property]) {
                            accumulators[property] = true
                        }
                    })
                })
                const invocations = accumulate.buffered.filter(accumulator => {
                    return accumulator.properties.filter(property => {
                        return referenced[property]
                    }).length != 0
                }).map(invocation => {
                    return $(`
                        `, invocation.source, `
                        $starts[${invocation.start}] = $start
                    `)
                })
                const block = []
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = join(condition.fields.map(dispatch.bind(null, path)))
                    if (condition.test != null) {
                        const registers = field.serialize.split ? [ path ] : []
                        const inlined = inliner(accumulate, path, [ condition.test ], registers)
                        block.push(`${i == 0 ? 'if' : 'else if'} (${inlined.inlined.shift()})` + $(`
                            {
                                `, source, `
                            }
                        `))
                    } else {
                        block.push($(`
                            else {
                                `, source, `
                            }
                        `))
                    }
                }
                return $(`
                    `, invocations.length != 0 ? invocations.join('\n') : null, `

                    `, snuggle(block), `
                `)
            }
        case 'literal':
        case 'integer':
            return `$start += ${field.bits / 8}`
        case 'fixed': {
                if (field.fixed) {
                    return $(`
                        $start += ${field.bits / 8}
                    `)
                } else {
                    throw new Error
                }
            }
            break
        case 'lengthEncoded':
            if (field.fields[0].fixed) {
                return field.fields[0].type == 'buffer' && !field.fields[0].concat
                ? $(`
                    $start += ${path}.reduce((sum, buffer) => sum + buffer.length, 0) +
                        ${field.fields[0].bits / 8} * ${path}.length
                `) : $(`
                    $start += ${field.encoding[0].bits / 8} +
                        ${field.fields[0].bits / 8} * ${path}.length
                `)
            } else {
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    $start += ${field.encoding[0].bits / 8}

                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                `)
                $i--
                return source
            }
        case 'terminated': {
                if (field.fields.filter(field => !field.fixed).length == 0) {
                    const bits = field.fields.reduce((sum, field) => sum + field.bits, 0)
                    return $(`
                        $start += ${bits / 8} * ${path}.length + ${field.terminator.length}
                    `)
                }
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                    $start += ${field.terminator.length}
                `)
                $i--
                return source
            }
            break
        case 'switch': {
                if (field.fixed) {
                    return $(`
                        $start += ${field.bits / 8}
                    `)
                }
                const cases = []
                for (const when of field.cases) {
                    cases.push($(`
                        ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                            `, join(when.fields.map(dispatch.bind(null, path))), `

                            break
                    `))
                }
                const select = field.stringify
                    ? `String((${field.source})(${packet.name}))`
                    : `(${field.source})(${packet.name})`
                return $(`
                    switch (${select}) {
                    `, join(cases), `
                    }
                `)
            }
            break
        case 'inline': {
                const inlines = field.before.filter(inline => {
                    return inline.properties.filter(property => {
                        return referenced[property]
                    }).length != 0
                })
                const inlined = inliner(accumulate, path, inlines, [ path ], '')
                const starts = []
                for (let i = inlined.buffered.start, I = inlined.buffered.end; i < I; i++) {
                    starts.push(`$starts[${i}] = $start`)
                }
                const source = map(dispatch, path, field.fields)
                // TODO Exclude if not externally referenced.
                const buffered = accumulate.buffered
                    .splice(0, inlined.buffered.end)
                    .map(buffered => {
                        return buffered.source
                    })
                return $(`
                    `, starts.length != 0 ? starts.join('\n') : null, -1, `

                    `, source, `

                    `, -1, buffered.length != 0 ? buffered.join('\n') : null, `
                `)
            }
            break
        case 'accumulator': {
                variables.accumulator = true
                const accumulators = field.accumulators
                    .filter(accumulator => referenced[accumulator.name])
                    .map(accumulator => accumulatorer(accumulate, accumulator))
                const declarations = accumulators.length != 0
                                   ? accumulators.join('\n')
                                   : null
                const source = field.fixed
                             ? `$start += ${field.bits / 8}`
                             : map(dispatch, path, field.fields)
                return  $(`
                    `, declarations, -1, `

                    `, source, `
                `)
            }
            break
        case 'structure': {
                if (field.fixed) {
                    return `$start += ${field.bits / 8}`
                }
                return map(dispatch, path, field.fields)
            }
            break
        }
    }

    const references = { accumulators: [], buffered: {} }, referenced = {}

    function dependencies (field) {
        switch (field.type) {
        case 'accumulator': {
                field.accumulators.forEach(accumulator => {
                    references.accumulators.push(accumulator.name)
                })
                field.fields.map(dependencies)
            }
            break
        case 'structure': {
                field.fields.map(dependencies)
            }
            break
        case 'fixed': {
                field.fields.map(dependencies)
            }
            break
        case 'inline': {
                field.before.forEach(inline => {
                    if (
                        inline.properties.filter(property => {
                            return /^(?:\$start|\$end)$/.test(property)
                        }).length != 0
                    ) {
                        references.accumulators.forEach(accumulator => {
                            if (inline.properties.includes(accumulator)) {
                                references.buffered[accumulator] = true
                            }
                        })
                    }
                })
                field.fields.map(dependencies)
            }
            break
        case 'conditional': {
                field.serialize.conditions.forEach(condition => {
                    if (condition.test == null) {
                        return
                    }
                    if (
                        condition.test.properties.filter(property => {
                            return /^(?:\$start|\$end)$/.test(property)
                        }).length != 0
                    ) {
                        buffered = true
                    }
                    condition.test.properties.forEach(property => {
                        if (references.buffered[property]) {
                            referenced[property] = true
                        }
                    })
                })
            }
            break
        case 'literal': {
                field.fields.map(dependencies)
            }
            break
        case 'switch': {
                field.cases.forEach(when => {
                    when.fields.map(dependencies)
                })
            }
            break
        case 'lengthEncoded': {
                field.fields.map(dependencies)
            }
            break
        case 'terminated':
        case 'integer':
        case 'absent':
        case 'buffer':
            break
        default: {
                throw new Error(field.type)
            }
            break
        }
    }

    dependencies(packet)

    const buffered = Object.keys(referenced).length != 0
    if (buffered) {
        variables.starts = true
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$start = 0',
        i: '$i = []',
        starts: '$starts = []',
        accumulator: '$accumulator = {}'
    }

    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])

    const requires = required(require)

    return  $(`
        sizeOf.${packet.name} = function () {
            `, requires, -1, `

            return function (${packet.name}) {
                let ${lets.join(', ')}

                `, source, `

                return $start
            }
        } ()
    `)
}

module.exports = function (packets, options = {}) {
    return join(packets.map(packet => generate(packet, options)))
}
