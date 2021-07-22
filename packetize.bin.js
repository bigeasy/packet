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

require('arguable')(module, async arguable => {
    const definitions = {}
    for (const file of arguable.argv) {
        const required = require(file)
        for (const name in required) {
            definitions[name] = required[name]
        }
    }
    const intermediate = language(definitions)
    console.log($(`
    const sizeOf = `, composers.sizeOf(intermediate, { require: {} }), `

    const serializer = {
        all: `, composers.serializer.all(intermediate, { require: {} }), `,
        inc: `, composers.serializer.inc(intermediate, { require: {} }), `
    }

    const parser = {
        all: `, composers.parser.all(intermediate, { require: {} }), `,
        inc: `, composers.parser.inc(intermediate, { require: {} }), `
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
    )
})
