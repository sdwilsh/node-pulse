var pulse = require("./pulse");

var callback = function(message) {
  console.info(message);
}

var conn = new pulse.TestConsumer("node-pulse-test", callback);
