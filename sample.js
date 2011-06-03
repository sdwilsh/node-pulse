var pulse = require("./pulse.js");

var callback = function(message) {
  console.info("Success!  Your connection works, and you just recieved this:");
  console.info(message);
  console.info("Now closing connection...");
  conn.close();
}

var conn = pulse.createConsumer("test", "node-pulse-test");
conn.on("message", callback);
