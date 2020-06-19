const crypto = require('crypto')

const BYTES = {}

class Hash {
    constructor (define, algorithm) {
        if (!(algorithm in BYTES)) {
            BYTES[algorithm] = crypto.createHash(algorithm).digest().length
        }
        define.parameters = [ 'buffer' ]
        define.packet = [[ BYTES[algorithm] ], [ 8 ]]
        this._hash = crypto.createHash(algorithm)
    }

    serialize (buffer) {
        this._hash.update(buffer)
    }

    parse (buffer) {
        this._hash.update(buffer)
    }

    digest () {
        this._hash.digest()
    }
}

module.exports = Hash
