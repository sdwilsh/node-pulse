var pulse = require("./pulse.js");

var callback = function(message) {
  console.info(message);
}

var conn = new pulse.TestConsumer("node-pulse-test", callback);
