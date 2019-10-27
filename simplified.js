module.exports = function (packet) {
    const parse = []
    const serialize = []
    for (const field in packet) {
        const def = packet[field]
        if (typeof def == 'number') {
            parse.push({
                name: field,
                type: 'integer',
                endianness: def < 0 ? 'l' : 'b',
                bits: Math.abs(def)
            })
            serialize.push({
                name: field,
                type: 'integer',
                endianness: def < 0 ? 'l' : 'b',
                bits: Math.abs(def)
            })
        }
    }
    return {
        parse: [{
            type: 'structure',
            name: 'object',
            fields: parse
        }],
        serialize: [{
            type: 'structure',
            name: 'object',
            fields: serialize
        }]
    }
}
