require('proof')(1, prove)

function prove (okay) {
    const constants = require('../../constants')
    const language = require('../../language')
    const ast = language({
        packet: {
            value: [ 8, [ 'off', 'on' ] ]
        }
    })
    okay(constants(ast), [
        "$lookup.packet = [ [ 'off', 'on' ] ]"
    ], 'basic')
}
