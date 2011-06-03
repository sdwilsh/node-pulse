var pulse = require("../pulse.js");
var testCase = require("nodeunit").testCase;
var sinon = require("sinon");
var amqp = require("amqp");
var events = require("events");

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

module.exports = testCase({
  setUp: function(callback)
  {
    this.createConnectionStub = sinon.stub(amqp, "createConnection");

    this.connection = new events.EventEmitter();
    this.connection.end = sinon.spy();
    this.createConnectionStub.returns(this.connection);

    callback();
  },
  tearDown: function(callback)
  {
    this.createConnectionStub.restore();
    callback();
  },

  test_no_work_until_listener: function(test)
  {
    test.expect(2);
    var c = new pulse.createConsumer("test", "test");
    test.equals(this.createConnectionStub.callCount, 0);

    c.on("message", function() {});
    test.ok(this.createConnectionStub.calledOnce);
    test.done();
  },

  test_consumer_prototype: function(test)
  {
    test.expect(kTypes.length);
    kTypes.forEach(function(type) {
      var c = new pulse.createConsumer(type, type);
      test.ok(c instanceof events.EventEmitter);
    });
    test.done();
  },

  test_error_reporting: function(test)
  {
    test.expect(1);
    var c = new pulse.createConsumer("test", "test");
    var kTestError = { name: "test error" };
    c.on("error", function(e) {
      test.strictEqual(e, kTestError);
      test.done();
    });
    this.connection.emit("error", kTestError);
  },

  test_close: function(test)
  {
    test.expect(6);

    // Closing an unopened connection should not throw.
    var c = new pulse.createConsumer("test", "test");
    test.doesNotThrow(function() { c.close(); });
    test.equal(this.connection.end.callCount, 0);

    // Closing an opened connection should not throw and clear out _server.
    c = new pulse.createConsumer("test", "test");
    c.on("message", function() {});
    test.doesNotThrow(function() { c.close(); });
    test.ok(this.connection.end.calledOnce);
    test.strictEqual(c._server, undefined);

    // Closing an already closed connection should throw though.
    test.throws(function() { c.close(); });

    test.done();
  },
});
