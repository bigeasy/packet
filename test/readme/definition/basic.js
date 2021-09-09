exports.packet = {
    object: {
        value: 32,
        string: [[
            ($_) => Buffer.from($_, 'utf8')
        ], [ 16, [ Buffer ] ], [
            ($_) => $_.toString('utf8')
        ]]
    }
}
