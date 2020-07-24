// Node.js API.
const util = require('util')

const map = require('./map')

// Determine necessary variables.
const { serialize: declare } = require('./declare')

// Format source code maintaining indentation.
const $ = require('programmatic')

// Generate accumulator declaration source.
const Inliner = require('./inline_')

// Generate accumulator declaration source.
const accumulatorer = require('./accumulator')

// Generate invocations of accumulators before conditionals.
const accumulations = require('./accumulations')

// Generate inline function source.
const inliner = require('./inliner')

// Generate required modules and functions.
const required = require('./required')

// Join an array of strings separated by an empty line.
const join = require('./join')

//

// Generate sizeof function for a given packet definition.

//
function generate (packet, { require = null }) {
    const { parameters, accumulators } = declare(packet)
    const variables = {
        register: true
    }
    const accumulate = new Inliner({
        packet, variables, accumulators, parameters,
        direction: 'serialize'
    })

    let $i = -1

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'structure': {
                if (field.fixed) {
                    return `$start += ${field.bits >>> 3}`
                }
                return map(dispatch, path, field.fields)
            }
            break
        case 'conditional': {
                const invocations = accumulations({
                    functions: field.serialize.conditions.map(condition => condition.test),
                    accumulate: accumulate
                })
                let ladder = '', keywords = 'if'
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = map(dispatch, path, condition.fields)
                    ladder = condition.test != null ? function () {
                        const registers = field.split ? [ path ] : []
                        const inline = inliner(accumulate, path, [ condition.test ], registers)
                        return $(`
                            `, ladder, `${keywords} (`, inline.inlined.shift(), `) {
                                `, source, `
                            }
                        `)
                    } () : $(`
                        `, ladder, ` else {
                            `, source, `
                        }
                    `)
                    keywords = ' else if'
                }
                return $(`
                    `, invocations, `

                    `, ladder, `
                `)
            }
        case 'switch': {
                if (field.fixed) {
                    return $(`
                        $start += ${field.bits >>> 3}
                    `)
                }
                const cases = []
                for (const when of field.cases) {
                    cases.push($(`
                        ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                            `, map(dispatch, path, when.fields), `

                            break
                    `))
                }
                const invocations = accumulations({
                    functions: [ field.select ],
                    accumulate: accumulate
                })
                const inlined = inliner(accumulate, path, [ field.select ], [])
                const select = field.stringify
                    ? `String(${inlined.inlined.shift()})`
                    : inlined.inlined.shift()
                return $(`
                    `, invocations, -1, `

                    switch (`, select, `) {
                    `, join(cases), `
                    }
                `)
            }
            break
        case 'fixed': {
                if (field.calculated) {
                    const element = field.fields[0]
                    const inline = inliner(accumulate, path, [ field.length ], [])
                    if (element.fixed) {
                        return $(`
                            $start += `, inline.inlined.shift(), ` * ${element.bits >>> 3}
                        `)
                    }
                    variables.i = true
                    const i = `$i[${++$i}]`
                    const source = $(`
                        for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                            `, map(dispatch, `${path}[${i}]`, field.fields), `
                        }
                    `)
                    return source
                } else if (field.fixed) {
                    return $(`
                        $start += ${field.bits >>> 3}
                    `)
                } else {
                    variables.i = true
                    const i = `$i[${++$i}]`
                    return $(`
                        for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                            `, map(dispatch, `${path}[${i}]`, field.fields), `
                        }
                    `)
                    $i--
                }
            }
            break
        case 'terminated': {
                // TODO Use AST rollup `fixed`.
                if (field.fields.filter(field => !field.fixed).length == 0) {
                    const bits = field.fields.reduce((sum, field) => sum + field.bits, 0)
                    return field.fields[0].type == 'buffer' && !field.fields[0].concat
                    ? $(`
                        $start += ${path}.reduce((sum, buffer) => sum + buffer.length, 0) +
                            ${field.terminator.length}
                    `) : $(`
                        $start += ${bits >>> 3} * ${path}.length + ${field.terminator.length}
                    `)
                }
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, map(dispatch, `${path}[${i}]`, field.fields), `
                    }
                    $start += ${field.terminator.length}
                `)
                $i--
                return source
            }
            break
        case 'lengthEncoded':
            if (field.fields[0].fixed) {
                return field.fields[0].type == 'buffer' && !field.fields[0].concat
                ? $(`
                    $start += ${path}.reduce((sum, buffer) => sum + buffer.length, 0) +
                        ${field.fields[0].bits >>> 3} * ${path}.length
                `) : $(`
                    $start += ${field.encoding[0].bits >>> 3} +
                        ${field.fields[0].bits >>> 3} * ${path}.length
                `)
            } else {
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    $start += ${field.encoding[0].bits >>> 3}

                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, map(dispatch, `${path}[${i}]`, field.fields), `
                    }
                `)
                $i--
                return source
            }
        case 'accumulator': {
                variables.accumulator = true
                const _accumulators = field.accumulators
                    .filter(accumulator => referenced[accumulator.name])
                    .map(accumulator => accumulatorer(accumulate, accumulators, parameters, accumulator))
                // TODO Really want to get rid of this step if the final
                // calcualtions are not referenced, if the argument is not an
                // external argument and if it is not referenced again in the
                // parse or serialize or sizeof.
                const declarations = _accumulators.length != 0
                                   ? _accumulators.join('\n')
                                   : null
                const source = field.fixed
                             ? `$start += ${field.bits >>> 3}`
                             : map(dispatch, path, field.fields)
                return  $(`
                    `, declarations, -1, `

                    `, source, `
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
                for (let i = inlined.buffered.offset, I = inlined.buffered.length; i < I; i++) {
                    starts.push(`$starts[${i}] = $start`)
                }
                const source = map(dispatch, path, field.fields)
                // TODO Exclude if not externally referenced.
                const buffered = accumulate.buffered
                    .splice(inlined.buffered.offset, inlined.buffered.length)
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
        case 'literal':
        case 'integer':
            return `$start += ${field.bits >>> 3}`
        }
    }

    const references = { accumulators: [], buffered: {} }, referenced = {}

    function dependencies (field) {
        switch (field.type) {
        case 'structure': {
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
                    condition.fields.map(dependencies)
                })
            }
            break
        case 'switch': {
                if (
                    field.select.properties.filter(property => {
                        return /^(?:\$start|\$end)$/.test(property)
                    }).length != 0
                ) {
                    buffered = true
                }
                field.select.properties.forEach(property => {
                    if (references.buffered[property]) {
                        referenced[property] = true
                    }
                })
                field.cases.forEach(when => {
                    when.fields.map(dependencies)
                })
            }
            break
        case 'fixed': {
                field.fields.map(dependencies)
            }
            break
        case 'terminated': {
                field.fields.map(dependencies)
            }
            break
        case 'lengthEncoded': {
                field.fields.map(dependencies)
            }
            break
        case 'accumulator': {
                field.accumulators.forEach(accumulator => {
                    references.accumulators.push(accumulator.name)
                })
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
        case 'literal': {
                field.fields.map(dependencies)
            }
            break
        case 'buffer':
        case 'integer':
        case 'absent':
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
