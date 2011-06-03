var pulse = require("../pulse.js");
var amqp = require("amqp");
var events = require("events");

// Before we do anything, we need to modify amqp.createConnection so that it
// does not actually try to connect to pulse.
gConnectionEvents = undefined;
amqp.createConnection = function() {
  var conn = new events.EventEmitter();
  conn.end = function() { this.closed = true; };
  return gConnectionEvents = conn;
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

  c.on("message", function() {});
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

exports.test_close = function(test) {
  test.expect(6);

  // Closing an unopened connection should not throw.
  var c = new pulse.createConsumer("test", "test");
  test.doesNotThrow(function() { c.close(); });
  test.strictEqual(gConnectionEvents.closed, undefined);

  // Closing an opened connection should not throw and clear out _server.
  c = new pulse.createConsumer("test", "test");
  c.on("message", function() {});
  test.doesNotThrow(function() { c.close(); });
  test.ok(gConnectionEvents.closed);
  test.strictEqual(c._server, undefined);

  // Closing an already closed connection should throw though.
  test.throws(function() { c.close(); });

  test.done();
};
