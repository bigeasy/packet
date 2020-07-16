const $ = require('programmatic')
const join = require('./join')

// Generate inline function source.
const inliner = require('./inliner')

const fiddle = require('./fiddle/pack')

function _fiddle (pack) {
    return fiddle(pack.bits, pack.offset, pack.size, pack.value)
}

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
                value: path + field.dotted
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
        }
        assignment = '|='
    }
    return flattened
}

function subPack (accumulate, root, path, bits, offset, fields) {
    const packed = [[]]
    for (const field of fields) {
        switch (field.type) {
        case 'integer': {
                packed[0].push({
                    bits: bits,
                    offset: offset,
                    size: field.bits,
                    value: field.value
                })
                offset += field.bits
            }
            break
        case 'conditional': {
                const { conditional, path, assignment } = field
                let ladder = '', keywords = 'if'
                for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                    const condition = conditional.serialize.conditions[i]
                    const source = module.exports.call(null, accumulate, root, {
                        bits: bits,
                        fields: condition.fields[0].type == 'integer' && condition.fields[0].fields
                              ? condition.fields[0].fields
                              : condition.fields
                    }, path, '$_', assignment, offset)
                    ladder = condition.test != null ? function () {
                        const inline = inliner(accumulate, path, [ condition.test ], [])
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
                offset += conditional.bits
                packed.unshift(ladder)
            }
            break
        case 'switch': {
                const { switched, path, assignment } = field, block = []
                const cases = []
                for (const when of switched.cases) {
                    const source = module.exports.call(null, accumulate, root, {
                        bits: bits,
                        fields: when.fields[0].type == 'integer' && when.fields[0].fields
                              ? when.fields[0].fields
                              : when.fields
                    }, path, '$_', assignment, offset)
                    cases.push($(`
                        ${when.otherwise ? 'default' : `case ${JSON.stringify(when.value)}`}:

                            `, source, `

                            break
                    `))
                }
                const inlined = inliner(accumulate, path, [ switched.select ], [])
                const select = switched.stringify
                    ? `String(${inlined.inlined.shift()})`
                    : inlined.inlined.shift()
                packed.unshift($(`
                    switch (`, select ,`) {
                    `, join(cases), `
                    }
                `))
            }
            break
        }
    }
    return packed.reverse()
}

// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function (accumulate, root, field, path, stuff, assignment = '=', offset = 0) {
    const block = [], flattened = flatten([], path, field.fields, assignment)
    for (const packed of subPack(accumulate, root, path, field.bits, offset, flattened)) {
        if (typeof packed == 'string') {
            block.push(packed)
        } else if (packed.length != 0) {
            block.push($(`
                ${stuff} ${assignment}
                    `, packed.map(_fiddle).join(' |\n'), `
            `))
        }
        assignment = '|='
    }
    return join(block)
}
