module.exports = function (transforms) {
  return function (object) {
    var field1;

    field1 = object["foo"]
    field1 = transforms.ascii(false, null, field1)

    return  3
  }

}