const { coalesce } = require('extant')

const composers = {
    parser: {
        inc: require('./parse.inc'),
        all: require('./parse.all')
    },
    serializer: {
        inc: require('./serialize.inc'),
        all: require('./serialize.all')
    },
    sizeOf: require('./sizeof'),
    lookup: require('./lookup')
}

const $ = require('programmatic')
const language = require('./language')

module.exports = function (definitions, { require = {} } = {}) {
    const intermediate = language(definitions)
    let lookup = composers.lookup(intermediate)
    if (lookup == '[]') {
        lookup = null
    }
    console.log('>>>', lookup)
    const lookupVar = lookup ? 'lookup' : ''
    return $(`
    const lookup = `, lookup, -1, `

    const sizeOf = `, composers.sizeOf(intermediate, { require: require }), `

    const serializer = {
        all: `, composers.serializer.all(intermediate, { require: require, lookup: lookupVar }), `,
        inc: `, composers.serializer.inc(intermediate, { require: require, lookup: lookupVar }), `
    }

    const parser = {
        all: `, composers.parser.all(intermediate, { require: require, lookup: lookupVar }), `,
        inc: `, composers.parser.inc(intermediate, { require: require, lookup: lookupVar }), `
    }

    module.exports = {
        sizeOf: sizeOf,
        serializer: {
            all: serializer.all,
            inc: serializer.inc,
            bff: function ($incremental) {
                return `, composers.serializer.all(intermediate, { bff: true, require: {}, lookup: lookupVar }), `
            } (serializer.inc)
        },
        parser: {
            all: parser.all,
            inc: parser.inc,
            bff: function ($incremental) {
                return `, composers.parser.all(intermediate, { bff: true, require: {}, lookup: lookupVar }), `
            } (parser.inc)
        }
    }

    `)
}
