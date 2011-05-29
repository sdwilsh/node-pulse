# node-pulse

This is a node.js library for listening to Mozilla Pulse messages.

## Installation

    npm install pulse

## Usage

Exports the following consumers:

* `TestConsumer` - messages on the `org.mozilla.exchange.pulse.test` exchange.
* `MetaConsumer` - messages on the `org.mozilla.exchange.pulse` exchange.
* `BugzillaConsumer` - messages on the `org.mozilla.exchange.bugzilla` exchange.
* `CodeConsumer` - messages on the `org.mozilla.exchange.code` exchange.
* `HgConsumer` - messages on the `hg.push.mozilla.central` exchange.
* `BuildConsumer` - messages on the `org.mozilla.exchange.build` exchange.

With the exception of `TestConsumer` which only takes a queue name, all consumers take a queue name and an array of topics on the exchange that they should listen to.  Each consumer is an `EventEmitter` that will emit `message` events for each new message.

See `sample.js` for an example using `TestConsumer`.
