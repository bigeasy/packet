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

module.exports = function (definitions, options = { require: {} }) {
    const intermediate = language(definitions)
    return $(`
    const sizeOf = `, composers.sizeOf(intermediate, { require: options.require }), `

    const serializer = {
        all: `, composers.serializer.all(intermediate, { require: options.require }), `,
        inc: `, composers.serializer.inc(intermediate, { require: options.require }), `
    }

    const parser = {
        all: `, composers.parser.all(intermediate, { require: options.require }), `,
        inc: `, composers.parser.inc(intermediate, { require: options.require }), `
    }

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
