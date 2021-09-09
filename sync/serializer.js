class Serializer {
    constructor (definition) {
        this._definition = definition
    }

    serialize (definition, object) {
        const size = this._definition.sizeOf[definition](object)
        const buffer = Buffer.alloc(size)
        this._definition.serializer.all[definition](object, buffer, 0)
        return buffer
    }
}

module.exports = Serializer
