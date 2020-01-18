// TODO Split encoding and encoded in the language.
module.exports = function (packet) {
    let fields = []
    for (let i = 0, I = packet.fields.length; i < I; i++) {
        const field = packet.fields[i]
        switch (field.type) {
        case 'lengthEncoded':
            fields.push({ ...field, type: 'lengthEncoding' })
            break
        }
        fields.push(field)
    }
    return { ...packet, fields }
}
