module.exports = function ({ $lookup }) {
    $lookup.push.apply($lookup, [
      [ 'off', 'on' ],
      [ 'no', 'yes' ],
      {
        forward: { '0': 'off', '1': 'on' },
        reverse: { off: '0', on: '1' }
      }
    ])
}
