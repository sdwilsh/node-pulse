# node-pulse

This is a node.js library for listening to Mozilla Pulse messages.

## Installation

    npm install pulse

## Usage

```
var pulse = require("pulse");

var callback = function(message) {
  console.info("Success!  Your connection works, and you just recieved this:");
  console.info(message);
  console.info("Now closing connection...");
  conn.close();
}

var conn = pulse.createConsumer("test", "node-pulse-test");
conn.on("message", callback);
```

## Consumers

Consumers are created by the `createConsumer` method and are instances of `events.EventEmitter`.  `Consumer`s emit two events:

* message
* error

### createConsumer(type, name [, topics])

Creates a `Consumer` with the queue name `name` and listens to all the topics specified by the `topics`.  `topics` can be an array of topics, a single topic, or if omitted, will default to all topics on the exchange (`#`).  This method supports the following arguments for `type`:

* `test` - binds to messages on the `org.mozilla.exchange.pulse.test` exchange.
* `meta` - binds to messages on the `org.mozilla.exchange.pulse` exchange.
* `bugzilla` - binds to messages on the `org.mozilla.exchange.bugzilla` exchange.
* `code` - binds to messages on the `org.mozilla.exchange.code` exchange.
* `build` - binds to messages on the `org.mozilla.exchange.build` exchange.

### Consumer.close()

Closes the connection to the Pulse server.

### Event: message

`function(message) { }`

Dispatched whenever a new message is received from Pulse.

### Event: error

`function(error) { }`

Dispatched whenever this is an amqp error with the connection.
