var amqp = require("amqp");
var events = require("events");

/**
 * Creates a connection to Mozilla Pulse
 */
function Connection(exchange, name, topics)
{
  if (!exchange) {
    throw "Must provide an exchange to listen to";
  }
  if (!name) {
    throw "Must provide the unique name for the queue";
  }
  if (!topics) {
    // Default to listen to everything.
    topics = ["#"];
  }
  if (!(topics instanceof Array)) {
    topics = [topics];
  }

  var server = amqp.createConnection({
    host: "pulse.mozilla.org",
    port: 5672,
    login: "public",
    password: "public",
    vhost: "/",
  });

  server.on("error", function(e) {
    console.error("AMQP ERROR: " + e);
  });

  server.on("ready", function() {
    var queue = server.queue(name);
    var x = server.exchange(exchange, {
        // Do not declare, just use what is there already.
        passive: true,
    });
    x.on("open", function() {
      topics.forEach(function(topic) {
        queue.bind(x, topic);
      });
    });

    queue.subscribe(function(message) {
      this.emit("message", message);
    }.bind(this));
  }.bind(this));
}

Connection.prototype = Object.create(events.EventEmitter.prototype);

////////////////////////////////////////////////////////////////////////////////
//// Consumers for various topics

function TestConsumer(name)
{
  var base = Connection.bind(this);
  base("org.mozilla.exchange.pulse.test", name);
}
TestConsumer.prototype = Object.create(Connection.prototype);
exports.TestConsumer = TestConsumer;

function MetaConsumer(name, topics)
{
  var base = Connection.bind(this);
  base("org.mozilla.exchange.pulse", name, topics);
}
MetaConsumer.prototype = Object.create(Connection.prototype);
exports.MetaConsumer = MetaConsumer;

function BugzillaConsumer(name, topics)
{
  var base = Connection.bind(this);
  base("org.mozilla.exchange.bugzilla", name, topics);
}
BugzillaConsumer.prototype = Object.create(Connection.prototype);
exports.BugzillaConsumer = BugzillaConsumer;

function CodeConsumer(name, topics)
{
  var base = Connection.bind(this);
  base("org.mozilla.exchange.code", name, topics);
}
CodeConsumer.prototype = Object.create(Connection.prototype);
exports.CodeConsumer = CodeConsumer;

function HgConsumer(name, topics)
{
  var base = Connection.bind(this);
  base("hg.push.mozilla.central", name, topics);
}
HgConsumer.prototype = Object.create(Connection.prototype);
exports.HgConsumer = HgConsumer;

function BuildConsumer(name, topics)
{
  var base = Connection.bind(this);
  base("org.mozilla.exchange.build", name, topics);
}
BuildConsumer.prototype = Object.create(Connection.prototype);
exports.BuildConsumer = BuildConsumer;
