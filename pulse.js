var amqp = require("amqp");
var events = require("events");

/**
 * Creates a connection to Mozilla Pulse
 */
function Consumer(exchange, name, topics)
{
  events.EventEmitter.call(this);

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

  // Lazily initialize ourselves when we actually get a listener.
  this.once("newListener", function() {
    var server = this._server = amqp.createConnection({
      host: "pulse.mozilla.org",
      port: 5672,
      login: "public",
      password: "public",
      vhost: "/",
    });

    server.on("error", function(e) {
      this.emit("error", e);
    }.bind(this));

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

  }.bind(this));
}

Consumer.prototype = Object.create(events.EventEmitter.prototype);

Consumer.prototype.close = function() {
  // If we are still listening for "newListener", we haven't opened a
  // connection, so there is nothing to close.
  if (this.listeners("newListener").length) {
    return;
  }

  if (!this._server) {
    throw new Error("Trying to close a connection that was already closed!");
  }

  this._server.end();
  delete this._server;
};

////////////////////////////////////////////////////////////////////////////////
//// Exports

exports.createConsumer = function(type, name, topics) {
  var exchange;
  switch (type) {
    case "test":
      exchange = "org.mozilla.exchange.pulse.test";
      break;
    case "meta":
      exchange = "org.mozilla.exchange.pulse";
      break;
    case "bugzilla":
      exchange = "org.mozilla.exchange.bugzilla";
      break;
    case "code":
      exchange = "org.mozilla.exchange.code";
      break;
    case "build":
      exchange = "org.mozilla.exchange.build";
      break;
    default:
      throw "Invalid type";
  }

  return new Consumer(exchange, name, topics);
};
