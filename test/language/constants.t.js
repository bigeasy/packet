require('proof')(1, prove)

function prove (okay) {
    const constants = require('../../constants')
    const simplified = require('../../simplified')
    const ast = simplified({
        packet: {
            value: [ 8, [ 'off', 'on' ] ]
        }
    })
    okay(constants(ast), [
        "$lookup.packet = [ [ 'off', 'on' ] ]"
    ], 'basic')
}
