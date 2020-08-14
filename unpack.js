// Node.js API.
const util = require('util')
const assert = require('assert')

const fiddle = require('./fiddle/unpack')
const unsign = require('./fiddle/unsign')
const join = require('./join')
const $ = require('programmatic')
const { structure } = require('./vivify')

function unpack (inliner, root, path, field, packed, offset = 0) {
    function generate (path, field, packed, offset) {
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
                bit += field.before.bits + field.after.bits
                if (field.fields.length == 0) {
                    return { type: 'constant' }
                }
                return unpack(path + field.dotted, field.fields[0])
            case 'integer':
                return {
                    type: 'integer',
                    bits: bits,
                    path: path + field.dotted,
                    packed: packed,
                    size: field.bits,
                    offset: advance(field.bits),
                    compliment: field.compliment,
                    lookup: field.lookup || null
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
            case 'inline':
                return {
                    type: 'inline',
                    bits: bits,
                    path: path + field.dotted,
                    packed: packed,
                    offset: bit,
                    size: advance(field.bits),
                    inline: field
                }
            }
        }
        const blocks = []
        for (const packing of field.fields.map(f => unpack(path, f))) {
            switch (packing.type) {
            case 'checkpoint':
                break
            case 'integer': {
                    const fiddled = fiddle(packing.bits, packing.offset, packing.size, packing.packed)
                    const assign = `${packing.path} = ${fiddled}`
                    if (packing.compliment) {
                        blocks.push($(`
                            $2s = ${fiddled}
                            ${packing.path} =
                                `, unsign('$2s', packing.size), `
                        `))
                    } else if (packing.lookup) {
                        blocks.push($(`
                            ${packing.path} = $lookup[${packing.lookup.index}][${fiddled}]
                        `))
                    } else {
                        blocks.push(assign)
                    }
                }
                break
            case 'inline': {
                    const { inline, path, offset } = packing
                    const inlined = inliner.inline(path, inline.after)
                    assert(inline.starts == null)
                    const vivifyed = inline.fields[0].type == 'integer' && inline.fields[0].fields
                    const source = generate(path, {
                        bits: bits,
                        fields: vivifyed ? inline.fields[0].fields : inline.fields
                    }, packed, offset)
                    blocks.push($(`
                        `, source, `

                        `, -1, inlined.inlined, `

                        `, -1, inliner.pop(), `
                    `))
                }
                break
            case 'conditional': {
                    const { conditional, path, offset } = packing
                    let ladder = '', keywords = 'if'
                    for (let i = 0, I = conditional.serialize.conditions.length; i < I; i++) {
                        const condition = conditional.serialize.conditions[i]
                        // TODO Can we use the univeral vivify here? (Ugh.)
                        const vivifyed = condition.fields[0].type == 'integer' && condition.fields[0].fields
                        const source = generate(path, {
                            bits: bits,
                            fields: vivifyed ? condition.fields[0].fields : condition.fields
                        }, packed, offset)
                        const vivify = vivifyed ? structure(path, condition.fields[0]) : null
                        ladder = condition.test != null ? function () {
                            const test = inliner.test(path, condition.test)
                            return $(`
                                `, ladder, `${keywords} (`, test, `) {
                                    `, vivify, -1, `

                                    `, source, `
                                }
                            `)
                        } () : $(`
                            `, ladder, ` else {
                                `, vivify, -1, `

                                `, source, `
                            }
                        `)
                        keywords = ' else if'
                    }
                    blocks.push(ladder)
                }
                break
            case 'switch': {
                    const { switched, path, offset } = packing, block = []
                    const cases = []
                    for (const when of switched.cases) {
                        const vivifyed = when.fields[0].type == 'integer' && when.fields[0].fields
                        const source = generate(path, {
                            bits: bits,
                            fields: vivifyed ? when.fields[0].fields : when.fields
                        }, packed, offset)
                        const vivify = vivifyed ? structure(path, when.fields[0]) : null
                        cases.push($(`
                            ${when.otherwise ? 'default' : `case ${util.inspect(when.value)}`}:
                                `, vivify, -1, `

                                `, source, `

                                break
                        `))
                    }
                    blocks.push($(`
                        switch (`, inliner.test(path, switched.select), `) {
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
    return generate(path, field, packed, offset)
}

module.exports = unpack
