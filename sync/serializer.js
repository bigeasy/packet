class Serializer {
    constructor (definition) {
        this._definition = definition
    }

    write (defintion, object) {
        const size = this._definition.sizeOf[defintion](object)
        const buffer = Buffer.alloc(size)
        this._definition.serializer.all[defintion](object, buffer, 0)
        return buffer
    }
}

module.exports = Serializer
