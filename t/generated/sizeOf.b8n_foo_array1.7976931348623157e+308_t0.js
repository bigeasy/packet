module.exports = function (transforms) {
  return function (object) {
    return (
      object["foo"].length +
      1
    )
  }

}