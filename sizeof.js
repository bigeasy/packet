const $ = require('programmatic')

const snuggle = require('./snuggle')
const join = require('./join')

function generate (packet) {
    const variables = {
        register: true
    }

    let $i = -1

    // TODO Fold constants, you're doing `$_ += 1; $_ += 2` which won't fold.
    function dispatch (path, field) {
        switch (field.type) {
        case 'conditional': {
                const block = []
                for (let i = 0, I = field.serialize.conditions.length; i < I; i++) {
                    const condition = field.serialize.conditions[i]
                    const source = join(condition.fields.map(dispatch.bind(null, path)))
                    if (condition.test != null) {
                        const signature = []
                        if (field.serialize.split) {
                            signature.push(path)
                        }
                        signature.push(packet.name)
                        block.push($(`
                            ${i == 0 ? 'if' : 'else if'} ((${condition.test.source})(${signature.join(', ')})) {
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
                return snuggle(block)
            }
        case 'literal':
        case 'integer':
            return `$_ += ${field.bits / 8}`
        case 'lengthEncoded':
            if (field.fields[0].fixed) {
                return $(`
                    $_ += ${field.encoding[0].bits / 8}

                    $_ += ${field.fields[0].bits / 8} * ${path}.length
                `)
            } else {
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    $_ += ${field.encoding[0].bits / 8}

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
                        $_ += ${bits / 8} * ${path}.length + ${field.terminator.length}
                    `)
                }
                variables.i = true
                $i++
                const i = `$i[${$i}]`
                const source = $(`
                    for (${i} = 0; ${i} < ${path}.length; ${i}++) {
                        `, join(field.fields.map(field => dispatch(path + `[${i}]`, field))), `
                    }
                    $_ += ${field.terminator.length}
                `)
                $i--
                return source
            }
            break
        case 'switch': {
                if (field.fixed) {
                    return $(`
                        $_ += ${field.bits / 8}
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
        case 'structure': {
                if (field.fixed) {
                    return `$_ += ${field.bits / 8}`
                }
                return join(field.fields.map(field => dispatch(path + field.dotted, field)))
            }
            break
        }
    }

    const source = dispatch(packet.name, packet)
    const declarations = {
        register: '$_ = 0',
        i: '$i = []'
    }
    const lets = Object.keys(declarations)
                            .filter(key => variables[key])
                            .map(key => declarations[key])

    return  $(`
        sizeOf.${packet.name} = function (${packet.name}) {
            let ${lets.join(', ')}

            `, source, `

            return $_
        }
    `)
}

module.exports = function (compiler, packets) {
    const sources = packets.map(packet => generate(packet))
    return compiler(join(sources))
}
