var net = require("net"),
    packet = require("./lib/packet");

var mysql = net.createConnection(3306);

var parser = packet.parser();
parser.packet("greeting", "n8", function (version) {
  console.log(version);
});

mysql.on("connect", function () {
  console.log("Connect.");
  mysql.end();
});
console.log("Okay.");
