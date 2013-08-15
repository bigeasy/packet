module.exports = function (transforms) {
  return function (object) {
    var field2;

    field2 = object["foo"]
    field2 = transforms.utf8(false, null, field2)

    return (
      field2.length +
      3
    )
  }

}