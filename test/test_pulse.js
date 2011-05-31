var pulse = require("../pulse.js");
var amqp = require("amqp");
var events = require("events");

// Before we do anything, we need to modify amqp.createConnection so that it
// does not actually try to connect to pulse.
gConnectionCreated = false;
amqp.createConnection = function() {
  gConnectionCreated = true;
  return new events.EventEmitter();
};

////////////////////////////////////////////////////////////////////////////////
//// Test Functions

exports.test_no_work_until_listener = function(test) {
  test.expect(2);
  var c = new pulse.TestConsumer("test");
  test.ok(!gConnectionCreated);

  c.on("success", function() {});
  test.ok(gConnectionCreated);
  test.done();
};

exports.test_consumer_prototype = function(test) {
  var types = [
    "TestConsumer",
    "MetaConsumer",
    "BugzillaConsumer",
    "CodeConsumer",
    "HgConsumer",
    "BuildConsumer",
  ];
  test.expect(types.length);
  types.forEach(function(type) {
    var c = new pulse[type](type);
    test.ok(c instanceof events.EventEmitter);
  });
  test.done();
};
