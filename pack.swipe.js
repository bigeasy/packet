// A recent implementation of packing, but one that is now untested and stale.
// Removing from the `serialize.all` generator for visibility.
module.exports = function _pack (field, object, stuff = 'let value') {
    const preface = []
    const packing = []
    let offset = 0
    for (let i = 0, I = field.fields.length; i < I; i++) {
        const packed = field.fields[i]
        switch (packed.type) {
        case 'integer': {
                let variable = object + '.' + packed.name
                if (packed.indexOf) {
                    constants.other = packed.indexOf
                    variable = `other.indexOf[${object}.${packed.name}]`
                }
                packing.push(' (' + pack(field.bits, offset, packed.bits, variable) + ')')
                offset += packed.bits
            }
            break
        case 'switch': {
                const cases = []
                for (const when of packed.when) {
                    if ('literal' in when) {
                        cases.push($(`
                            case ${JSON.stringify(when.value)}:
                                ${packed.name} = ${JSON.stringify(when.literal)}
                                break
                        `))
                    } else {
                        cases.push($(`
                            case ${JSON.stringify(when.value)}:
                                `, _pack(when, object, 'flags'), `
                                break
                        `))
                    }
                }
                preface.push($(`
                    let ${packed.name}
                    switch ((${packed.value})(object)) {
                    `, cases.join('\n'), `
                    }
                `))
                packing.push(` (${pack(4, offset, packed.bits, packed.name)})`)
            }
            break
        }
    }
    if (preface.length) {
        return $(`
            `, preface.join('\n'), `

            ${stuff} =
                `, packing.join(' |\n'), `
        `)
    }
    return $(`
        ${stuff} =
            `, packing.join(' |\n'), `
    `)
}
