var pulse = require("../pulse.js");
var amqp = require("amqp");
var events = require("events");

// Before we do anything, we need to modify amqp.createConnection so that it
// does not actually try to connect to pulse.
gConnectionEvents = undefined;
amqp.createConnection = function() {
  return gConnectionEvents = new events.EventEmitter();
};

////////////////////////////////////////////////////////////////////////////////
//// Test Functions

exports.test_no_work_until_listener = function(test) {
  test.expect(2);
  var c = new pulse.TestConsumer("test");
  test.strictEqual(gConnectionEvents, undefined);

  c.on("success", function() {});
  test.ok(gConnectionEvents);
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

exports.test_error_reporting = function(test) {
  test.expect(1);
  var c = new pulse.TestConsumer("test");
  var kTestError = { name: "test error" };
  c.on("error", function(e) {
    test.strictEqual(e, kTestError);
    test.done();
  });
  gConnectionEvents.emit("error", kTestError);
};
