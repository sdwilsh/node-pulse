var amqp = require('amqp');

/**
 * Creates a connection to Mozilla Pulse
 */
function Pulse(name, exchanges, callback)
{
  if (!name) {
    throw "Must provide the unique name for the queue";
  }
  if (!exchanges) {
    throw "Must provide a set of exchanges to listen to";
  }
  if (!callback) {
    throw "How can you consume any messages if you don't have a callback?";
  }

  this.server = amqp.createConnection({
    host: "pulse.mozilla.org",
    port: 5672,
    login: "public",
    password: "public",
    vhost: "vhost",
  });

  this.server.addListener("error", function(e) {
    console.error("AMQP ERROR: " + e);
  });

  this.server.addListener("ready", function() {
    var queue = this.server.queue(name);
    exchanges.forEach(function(exchange) {
      var x = this.server.exchange(exchange, {
        // Do not declare, just use what is there already.
        passive: true,
      });
      queue.bind(x, "#");
    });

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

Pulse.prototype =
{
};

exports.Pulse = Pulse;