// Node.js API.
const util = require('util')

const $ = require('programmatic')
const join = require('./join')

const fiddle = require('./fiddle/pack')

function flatten (flattened, path, fields, assignment = '=') {
    for (const field of fields) {
        switch (field.type) {
        case 'literal':
            if (field.before.repeat != 0) {
                flattened.push({
                    type: 'integer',
                    compliment: false,
                    bits: field.before.bits,
                    value: '0x' + field.before.value
                })
            }
            flatten(flattened, path + field.dotted, field.fields)
            if (field.after.repeat != 0) {
                flattened.push({
                    type: 'integer',
                    compliment: false,
                    bits: field.after.bits,
                    value: '0x' + field.after.value
                })
            }
            break
        case 'integer':
            flattened.push({
                type: 'integer',
                bits: field.bits,
                compliment: field.compliment,
                value: path + field.dotted,
                lookup: field.lookup || null
            })
            break
        case 'conditional':
            flattened.push({
                type: 'conditional',
                path: path + field.dotted,
                assignment: assignment,
                conditional: field
            })
            break
        case 'switch':
            flattened.push({
                type: 'switch',
                path: path + field.dotted,
                assignment: assignment,
                switched: field
            })
            break
        case 'inline':
            flattened.push({
                type: 'inline',
                path: path + field.dotted,
                assignment: assignment,
                inline: field
            })
            break
        }
        assignment = '|='
    }
    return flattened
}


// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function (inliner, field, path) {
    const seen = {}
    function pack (path, bits, offset, fields) {
        const packed = [[]]
        for (const field of fields) {
            switch (field.type) {
            case 'integer': {
                    packed[0].push({
                        bits: bits,
                        offset: offset,
                        size: field.bits,
                        value: field.value,
                        lookup: field.lookup
                    })
                    offset += field.bits
                }
                break
            case 'inline': {
                    const { path, assignment, inline } = field
                    const inlined = inliner.inline(path, inline.before)
                    const source = generate({
                        bits: bits,
                        fields: inline.fields[0].type == 'integer' && inline.fields[0].fields
                            ? inline.fields[0].fields
                            : inline.fields
                    }, inlined.path, '$_', assignment, offset)
                    offset += inline.bits
                    packed.unshift([], $(`
                        `, inlined.inlined, `

                        `, source, `

                        `, -1, inliner.pop(), `
                    `))
                }
                break
            case 'conditional': {
                    const {
                        conditional, path, assignment, conditional: { serialize: { conditions } }
                    } = field
                    const tests = conditions.filter(condition => condition.test != null)
                                            .map(condition => condition.test)
                    const invocations = inliner.accumulations(tests)
                    let ladder = $(`
                        `, invocations, -1, `

                    `), keywords = 'if'
                    for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                        const condition = conditional.serialize.conditions[i]
                        const source = generate({
                            bits: bits,
                            fields: condition.fields[0].type == 'integer' && condition.fields[0].fields
                                  ? condition.fields[0].fields
                                  : condition.fields
                        }, path, '$_', assignment, offset)
                        ladder = condition.test != null ? function () {
                            const test = inliner.test(path, condition.test)
                            return $(`
                                `, ladder, `${keywords} (`, test, `) {
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
                    offset += conditional.bits
                    // Isn't this `packed.unshift([], ladder)`? See inline,
                    // write tests.
                    packed.unshift(ladder)
                }
                break
            case 'switch': {
                    const { switched, path, assignment } = field, block = []
                    const invocations = inliner.accumulations([ switched.select ])
                    const cases = []
                    for (const when of switched.cases) {
                        const source = generate({
                            bits: bits,
                            fields: when.fields[0].type == 'integer' && when.fields[0].fields
                                  ? when.fields[0].fields
                                  : when.fields
                        }, path, '$_', assignment, offset)
                        cases.push($(`
                            ${when.otherwise ? 'default' : `case ${util.inspect(when.value)}`}:

                                `, source, `

                                break
                        `))
                    }
                    packed.unshift($(`
                        `, invocations, -1, `

                        switch (`, inliner.test(path, switched.select) ,`) {
                        `, join(cases), `
                        }
                    `))
                }
                break
            }
        }
        return packed.reverse()
    }

    function generate (field, path, stuff, assignment = '=', offset = 0) {
        const block = [], flattened = flatten([], path, field.fields, assignment)
        for (const packed of pack(path, field.bits, offset, flattened)) {
            if (typeof packed == 'string') {
                block.push(packed)
            } else if (packed.length != 0) {
                const fiddles = packed.map(pack => {
                    const value = function () {
                        if (pack.lookup != null) {
                            return `$lookup[${pack.lookup.index}].indexOf(${pack.value})`
                        }
                        return pack.value
                    } ()
                    return fiddle(pack.bits, pack.offset, pack.size, value)
                })
                block.push($(`
                    ${stuff} ${assignment}
                        `, fiddles.join(' |\n'), `
                `))
            }
            assignment = '|='
        }
        return join(block)
    }

    return generate(field, path, '$_', '=', 0)
}
