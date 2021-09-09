const sizeOf = {

}

const serializer = {
    all: {

    },
    inc: {

    }
}

const parser = {
    all: {

    },
    inc: {

    }
}

module.exports = {
    sizeOf: sizeOf,
    serializer: {
        all: serializer.all,
        inc: serializer.inc,
        bff: function ($incremental) {
            return {

            }
        } (serializer.inc)
    },
    parser: {
        all: parser.all,
        inc: parser.inc,
        bff: function ($incremental) {
            return {

            }
        } (parser.inc)
    }
}
