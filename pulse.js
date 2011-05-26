var amqp = require('amqp');

/**
 * Creates a connection to Mozilla Pulse
 */
function Connection(exchange, name, callback)
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

  var server = this.server = amqp.createConnection({
    host: "pulse.mozilla.org",
    port: 5672,
    login: "public",
    password: "public",
    vhost: "/",
  });

  server.addListener("error", function(e) {
    console.error("AMQP ERROR: " + e);
  });

  server.addListener("ready", function() {
    var queue = server.queue(name);
    var x = server.exchange(exchange, {
        // Do not declare, just use what is there already.
        passive: true,
    });
    queue.bind(x, "#");

    queue.subscribe(function(message) {
      try {
        callback(message);
      }
      catch (e) {
        console.error(e);
      }
    });
  });
}

Connection.prototype =
{
};

function TestConsumer(name, callback)
{
  this.conn = new Connection("org.mozilla.exchange.pulse.test", name, callback);
}
exports.TestConsumer = TestConsumer;

