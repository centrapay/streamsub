# Streamsub

Robust, scalable pubsub over Redis streams.

## Installation

```bash
npm install @centrapay/streamsub
```

## Usage

```javascript
require('@centrapay/streamsub');
//...
```


## History

See [Changelog](./CHANGELOG.md)


## Redis Streams Pubsub Walkthrough

This walkthrough demonstrates the Redis streams commands which are relevant to
implementing pubsub and explains how they are incorporated into StreamSub.
Compared with the official [Redis Streams Intro][], this guide points out some
not-so-clear details related to using Redis streams for pubsub.

The following Redis streams concepts are the building blocks for a pubsub
solution using Redis:

 1. **Stream** - A list-like, append-only, data structure that offers random
    access and allows us to block while waiting for new entries. In a pubsub
    scenario the stream acts as a logical topic - we publish to the stream but
    do not read directly from the stream.

 2. **Consumer Group** - A logical subscription to a stream which routes
    messages to one of many participating consumers and keeps track of the
    acknowledgement status for each message in a "Pending Entries List".
    Typically a consumer group would be defined for each distinct usage of a
    "topic" stream and would be shared by all instances of a clustered
    application.

 3. **Consumer** - An uniquely identifiable consumer of messages. The typical
    scope for a consumer is a single instance of a clustered application.


The commands that follow should be run in order after starting Redis on the
standard port.


### 1. Create consumer group

Unlike streams, Redis stream consumer groups must be created explicitly.
```
scripts/redis-xgroup-create.js stream-1 group-1
```

Consumer groups are scoped to a stream. Different consumer groups can share
the same name if they are created on different streams.

When initialized, the StreamSub client will automatically create Redis stream
consumer groups for all registered subscribers.

Redis docs: [XGROUP][]


### 2. Add messages to a stream

A sequential message id is automatically assigned by Redis when a message is
added to a stream. Streams are created automatically when the first message is
added.

```
scripts/redis-xadd.js stream-1 msg1
scripts/redis-xadd.js stream-1 msg2
scripts/redis-xadd.js stream-1 msg3
```

Publishers can set a stream's optional max length. StreamSub publishers set a
default max length of "~100".

Redis docs: [XADD][]


### 3. Inspect stream contents

Read all messages with id > 0:
```
scripts/redis-xread.js stream-1 0
```

StreamSub clients do not utilize this operation but it can be useful as a
debugging tool.

Redis docs: [XREAD][]


### 4. Read messages via consumer group

Read two new messages via consumer group:

```
scripts/redis-xreadgroup.js group-1 consumer-1 2 stream-1 '>'
```

Re-read previously delivered, unacknowledged, messages with id greater than
"0". Consumers should do this when starting up in order to recover from a
crash:

```
scripts/redis-xreadgroup.js group-1 consumer-1 stream-1 0
```

Consumer group consumers are created automatically on first read. The special
id ">" matches messages not yet delivered to any consumer. Because the group
was declared with "$" as the start id, only messages added to the stream since
the group was created can be consumed via the group.

StreamSub clients, once started and until stopped, continuously attempt to read
messages for all registered subscribers.

**A Note on connection use:** Reading from a consumer group blocks the Redis
connection for potentially a long time until it returns a result or times out.
To avoid multiple read queries blocking each other, a distinct Redis client
instance can be used for each concurrent read query.  To mitigate having an
explosion in the number of Redis connections open when reading from consumer
groups, multiple consumer groups can be read with a single read query when they
have the same group name. Thus, to maximize connection reuse, applications
should aim to use the broadest applicable group names where it makes sense.  As
a guideline, consumer groups should typically be named using an application or
system component name instead of an event name which would typically be the
case for streams.

```
scripts/redis-xreadgroup.js group-1 consumer-1 10 stream-1 stream-2 '>' '>'
```

StreamSub clients must be instantiated with a consumer id which will
effectively grant them exclusive visibility over delivered messages. A suitable
consumer id will depend on the nature of the application deployment. A typical
approach may be to combine the app name with the hostname.

Redis docs: [XREADGROUP][]


### 5. Acknowledge a message

A message can no longer be read via the group for which it was acknowledged.

```
scripts/redis-xack.js stream-1 group-1 ${msg_id}
```

StreamSub clients automatically acknowledge processed messages.

Redis docs: [XACK][]


### 6. Find overdue pending messages

The XPENDING command returns information about pending messages for a consumer
group (messages that have been read by a consumer but not acknowledged). The
summary form of XPENDING does not provide any idle time information so it is not
useful for detecting overdue messages but may be useful for debugging.

```
scripts/redis-xpending-summary.js stream-1 group-1
```

The detail form of XPENDING includes message ids and idle time in milliseconds
and returns messages in order of idle time descending. The additional "start
id", "end id" and "count" parameters are required. The special ids "-" and "+"
can be used to indicate lowest and highest ids available.

```
scripts/redis-xpending.js stream-1 group-1 - + 10
```

The XAUTOCLAIM command can be used to easily find and claim overdue pending
messages with a single operation.  XAUTOCLAIM requires Redis 6.2 which is
unreleased as of writing (Jan 2021).

StreamSub clients will periodically use XPENDING to check for pending messages
for each registered subscriber and attempt to claim those that are considered
overdue.

Redis docs: [XPENDING][], [XAUTOCLAIM][]


### 7. Claim overdue messages

Messages can be reassigned to a different consumer (claimed) by calling XCLAIM.
When multiple consumers compete to claim messages only one consumer will
succeed.

```
scripts/redis-xclaim.js stream-1 group-1 consumer-1 120000 ${msg_id}
```

StreamSub clients will automatically attempt to claim pending messages which
appear to be overdue.

Redis docs: [XCLAIM][]


### 8. Inspect consumer status for group

```
scripts/redis-xinfo-consumers.js stream-1 group-1
```

All consumers are listed with pending message count and idle time.

If consumer ids are non-deterministic (eg based on Kubernetes pod name) then
Consumers which are idle for a long time are probably defunct and should be
considered for deletion. Consumer idle time is not reset when reading using ">"
as the message id and no messages were returned. StreamSub clients will
periodically read messages using an id other than ">" to ensure idle time is
updated.

Redis docs: [XINFO][]


### 9. Delete consumer

```
scripts/redis-xgroup-delconsumer.js stream-1 group-1 consumer-2
```

Pending messages associated with a consumer group are effectively acknowledged
when the consumer group is deleted.

StreamSub clients can be instructed to find and delete all consumers which have
been idle for too long.

Redis docs: [XGROUP][]


## Legal

Copyright © 2021 [Centrapay][].

This software is licensed under Apache-2.0 License. Please see [LICENSE](/LICENSE) for details.



[Centrapay]: https://centrapay.com/
[Redis Streams Intro]: https://redis.io/topics/streams-intro
[XADD]: https://redis.io/commands/xadd
[XREAD]: https://redis.io/commands/xread
[XGROUP]: https://redis.io/commands/xgroup
[XREADGROUP]: https://redis.io/commands/xreadgroup
[XACK]: https://redis.io/commands/xack
[XINFO]: https://redis.io/commands/xinfo
[XPENDING]: https://redis.io/commands/xpending
[XCLAIM]: https://redis.io/commands/xclaim
[XAUTOCLAIM]: https://redis.io/commands/xautoclaim
