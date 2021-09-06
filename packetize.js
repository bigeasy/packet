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
    const lookup = composers.lookup(intermediate)
    const synchronous = lookup == '[]' ? $(`
        const sizeOf = `, composers.sizeOf(intermediate, { require: require }), `

        const serializer = {
            all: `, composers.serializer.all(intermediate, { require: require }), `,
            inc: `, composers.serializer.inc(intermediate, { require: require }), `
        }

        const parser = {
            all: `, composers.parser.all(intermediate, { require: require }), `,
            inc: `, composers.parser.inc(intermediate, { require: require }), `
        }
    `) : $(`
        const lookup = `, composers.lookup(intermediate), `

        const sizeOf = `, composers.sizeOf(intermediate, { require: require }), `

        const serializer = {
            all: function ($lookup) {
                return `, composers.serializer.all(intermediate, { require: require }), `
            } (lookup),
            inc: function ($lookup) {
                return `, composers.serializer.inc(intermediate, { require: require }), `
            } (lookup)
        }

        const parser = {
            all: function ($lookup) {
                return `, composers.parser.all(intermediate, { require: require }), `
            } (lookup),
            inc: function ($lookup) {
                return `, composers.parser.inc(intermediate, { require: require }), `
            } (lookup)
        }
    `)
    return $(`
        `, synchronous, `

        module.exports = {
            sizeOf: sizeOf,
            serializer: {
                all: serializer.all,
                inc: serializer.inc,
                bff: function ($incremental) {
                    return `, composers.serializer.all(intermediate, { bff: true, require: {} }), `
                } (serializer.inc)
            },
            parser: {
                all: parser.all,
                inc: parser.inc,
                bff: function ($incremental) {
                    return `, composers.parser.all(intermediate, { bff: true, require: {} }), `
                } (parser.inc)
            }
        }

    `)
}
