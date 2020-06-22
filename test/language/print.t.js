require('proof')(1, okay => {
    const print = require('../../print')
    console.log(print({
        ip: 32
    }, [ 'ip' ], 'integers must be devisible by 8'))
    console.log(print({
        packet: {
            value: 32,
            array: [ 32, [ null ]]
        }
    }, [ 'packet', 'array' ], 'unable to parse length-encoded element type'))
})
