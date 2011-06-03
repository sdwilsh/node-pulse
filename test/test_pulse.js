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
//// Constants

var kTypes = [
  "test",
  "meta",
  "bugzilla",
  "code",
  "build",
];

////////////////////////////////////////////////////////////////////////////////
//// Test Functions

exports.test_no_work_until_listener = function(test) {
  test.expect(2);
  var c = new pulse.createConsumer("test", "test");
  test.strictEqual(gConnectionEvents, undefined);

  c.on("success", function() {});
  test.ok(gConnectionEvents);
  test.done();
};

exports.test_consumer_prototype = function(test) {
  test.expect(kTypes.length);
  kTypes.forEach(function(type) {
    var c = new pulse.createConsumer(type, type);
    test.ok(c instanceof events.EventEmitter);
  });
  test.done();
};

exports.test_error_reporting = function(test) {
  test.expect(1);
  var c = new pulse.createConsumer("test", "test");
  var kTestError = { name: "test error" };
  c.on("error", function(e) {
    test.strictEqual(e, kTestError);
    test.done();
  });
  gConnectionEvents.emit("error", kTestError);
};
