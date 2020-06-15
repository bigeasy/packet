const fiddle = require('./fiddle/unpack')
const unsign = require('./fiddle/unsign')
const snuggle = require('./snuggle')
const join = require('./join')
const $ = require('programmatic')
const { structure } = require('./vivify')

function _fiddle (pack) {
    return fiddle(pack.bits, pack.offset, pack.size, pack.packed)
}

function unpack (root, path, field, packed, offset = 0) {
    let bits = field.bits, bit = offset
    function advance (size) {
        const offset = bit
        bit += size
        return offset
    }
    function unpack (path, field) {
        switch (field.type) {
        case 'checkpoint':
            return field
        case 'literal':
            bit += field.before.bits || 0
            const unpacked = unpack(path + field.dotted, field.fields[0])
            bit += field.after.bits || 0
            return unpacked
        case 'integer':
            return {
                type: 'integer',
                bits: bits,
                path: path + field.dotted,
                packed: packed,
                size: field.bits,
                offset: advance(field.bits),
                compliment: field.compliment
            }
        case 'conditional':
            return {
                type: 'conditional',
                bits: bits,
                path: path + field.dotted,
                packed: packed,
                offset: bit,
                size: advance(field.bits),
                conditional: field
            }
        case 'switch':
            return {
                type: 'switch',
                bits: bits,
                path: path + field.dotted,
                packed: packed,
                offset: bit,
                size: advance(field.bits),
                switched: field
            }
        }
    }
    const blocks = []
    for (const packing of field.fields.map(f => unpack(path, f))) {
        switch (packing.type) {
        case 'checkpoint':
            break
        case 'integer': {
                const assign = `${packing.path} = ${_fiddle(packing)}`
                if (packing.compliment) {
                    blocks.push($(`
                        `, assign, `
                        ${packing.path} =
                            `, unsign(packing.path, packing.size), `
                    `))
                } else {
                    blocks.push(assign)
                }
            }
            break
        case 'conditional': {
                const { conditional, path, offset } = packing, ladder = []
                for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                    const condition = conditional.serialize.conditions[i]
                    const vivifyed = condition.fields[0].type == 'integer' && condition.fields[0].fields
                    const source = module.exports.call(null, root, path, {
                        bits: bits,
                        fields: vivifyed ? condition.fields[0].fields : condition.fields
                    }, packed, offset)
                    const vivify = vivifyed ? structure(path, condition.fields[0]) : null
                    if (condition.test != null) {
                        ladder.push($(`
                            ${i == 0 ? 'if' : 'else if'} ((${condition.test.source})(${root.name})) {
                                `, vivify, -1, `

                                `, source, `
                            }
                        `))
                    } else {
                        ladder.push($(`
                            else {
                                `, vivify, -1, `

                                `, source, `
                            }
                        `))
                    }
                }
                blocks.push(snuggle(ladder))
            }
            break
        case 'switch': {
                const { switched, path, offset } = packing, block = []
                const cases = []
                for (const when of switched.cases) {
                    const vivifyed = when.fields[0].type == 'integer' && when.fields[0].fields
                    const source = module.exports.call(null, root, path, {
                        bits: bits,
                        fields: vivifyed ? when.fields[0].fields : when.fields
                    }, packed, offset)
                    const vivify = vivifyed ? structure(path, when.fields[0]) : null
                    cases.push($(`
                        case ${JSON.stringify(when.value)}:
                            `, vivify, -1, `

                            `, source, `

                            break
                    `))
                }
                if (switched.otherwise) {
                    const vivifyed = switched.otherwise[0].type == 'integer' && switched.otherwise
                    const source = module.exports.call(null, root, path, {
                        bits: bits,
                        fields: vivifyed ? switched.otherwise[0].fields : switched.otherwise
                    }, packed, offset)
                    const vivify = vivifyed ? structure(path, switched.otherwise[0]) : null
                    cases.push($(`
                        default:
                            `, vivify, -1, `

                            `, source, `

                            break
                    `))
                }
                const select = switched.stringify
                    ? `String((${switched.source})(${root.name}))`
                    : `(${switched.source})(${root.name})`
                blocks.push($(`
                    switch (${select}) {
                    `, join(cases), `
                    }
                `))
            }
            break
        }
        offset += packing.bits
    }
    return join(blocks)
}

module.exports = unpack
