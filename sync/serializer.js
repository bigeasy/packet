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

const serializer = new Serializer(require('../generated'))

const buffer = serializer.write('first', { value: 0xaaaa })
console.log(buffer.toJSON())
