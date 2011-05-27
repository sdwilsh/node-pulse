var amqp = require('amqp');

/**
 * Creates a connection to Mozilla Pulse
 */
function Connection(exchange, name, callback, topics)
{
  if (!exchange) {
    throw "Must provide an exchange to listen to";
  }
  if (!name) {
    throw "Must provide the unique name for the queue";
  }
  if (!callback) {
    throw "How can you consume any messages if you don't have a callback?";
  }
  if (!topics) {
    // Default to listen to everything.
    topics = ["#"];
  }
  if (!(topics instanceof Array)) {
    topics = [topics];
  }

  var server = this.server = amqp.createConnection({
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
      try {
        callback(message);
      }
      catch (e) {
        console.error(e.stack);
      }
    });
  });
}

Connection.prototype =
{
};

////////////////////////////////////////////////////////////////////////////////
//// Consumers for various topics

function TestConsumer(name, callback)
{
  this.conn = new Connection("org.mozilla.exchange.pulse.test", name, callback);
}
exports.TestConsumer = TestConsumer;

function MetaConsumer(name, callback, topics)
{
  this.conn = new Connection("org.mozilla.exchange.pulse", name, callback,
                             topics);
}
exports.MetaConsumer = MetaConsumer;

function BugzillaConsumer(name, callback, topics)
{
  this.conn = new Connection("org.mozilla.exchange.bugzilla", name, callback,
                             topics);
}
exports.BugzillaConsumer = BugzillaConsumer;

function CodeConsumer(name, callback, topics)
{
  this.conn = new Connection("org.mozilla.exchange.code", name, callback,
                             topics);
}
exports.CodeConsumer = CodeConsumer;

function HgConsumer(name, callback, topics)
{
  this.conn = new Connection("hg.push.mozilla.central", name, callback,
                             topics);
}
exports.HgConsumer = HgConsumer;

function BuildConsumer(name, callback, topics)
{
  this.conn = new Connection("org.mozilla.exchange.build", name, callback,
                             topics);
}
exports.BuildConsumer = BuildConsumer;
