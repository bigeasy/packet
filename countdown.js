class Countdown {
    constructor (define, path, $) {
        define.parameters = [ 'sizeof' ]
        define.direction = 'parse'
        let iterator = $
        for (const part of path.split('.')) {
            iterator = iterator[part]
        }
        this.remaining = iterator
    }

    serialize (length) {
        this.remaining -= length
    }

    parse (length) {
        this.remaining -= length
    }
}

module.exports = Countdown
