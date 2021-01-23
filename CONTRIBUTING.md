# Contributing to StreamSub

## Interacting with Redis

After running Redis with `docker-compose up`, the Redis Commander UI is
available at: http://localhost:8081.

Alternatively, an interactive Redis shell can be opened by running:

```
docker-compose exec redis redis-cli
```


## Redis Command Scripts

The "scripts" directory contains a collection of "redis" scripts which can be
used to test Redis stream operations via the JavaScript client.

The following table lists the scripts and links to the Redis command
docs, indicates whether the command is required to implement pubsub and
summarizes the use for the command with respect to working with pubsub on Redis
streams.


| Command            | Docs           | Pubsub | Use                                   |
| ------------------ | ---------      | :----: | --------------                        |
| get                | [GET][]        |        | Test stream/map key conflicts         |
| set                | [SET][]        |        | Test stream/map key conflicts         |
| xadd               | [XADD][]       | ✔      | Publish message                       |
| xread              | [XREAD][]      |        | Read messages from underlying stream  |
| xreadgroup         | [XREADGROUP][] | ✔      | Read messages from subscription       |
| xack               | [XACK][]       | ✔      | Acknowledge message                   |
| xdel               | [XDEL][]       |        | Delete message from underlying stream |
| xlen               | [XLEN][]       |        | Check size of underlying stream       |
| xgroup-create      | [XGROUP][]     | ✔      | Create subscription                   |
| xgroup-destroy     | [XGROUP][]     |        | Delete subscription                   |
| xgroup-delconsumer | [XGROUP][]     | ✔      | Delete dead consumer                  |
| xinfo-stream       | [XINFO][]      |        | Get stream's summary info             |
| xinfo-groups       | [XINFO][]      |        | Get subscription's summary info       |
| xinfo-consumers    | [XINFO][]      | ✔      | Find dead consumers                   |
| xpending-summary   | [XPENDING][]   |        | Get consumer pending message counts   |
| xpending           | [XPENDING][]   | ✔      | Find overdue pending messages         |
| xclaim             | [XCLAIM][]     | ✔      | Reassign overdue messages             |



[GET]: https://redis.io/commands/get
[SET]: https://redis.io/commands/set
[XADD]: https://redis.io/commands/xadd
[XREAD]: https://redis.io/commands/xread
[XDEL]: https://redis.io/commands/xdel
[XLEN]: https://redis.io/commands/xlen
[XGROUP]: https://redis.io/commands/xgroup
[XREADGROUP]: https://redis.io/commands/xreadgroup
[XACK]: https://redis.io/commands/xack
[XINFO]: https://redis.io/commands/xinfo
[XPENDING]: https://redis.io/commands/xpending
[XCLAIM]: https://redis.io/commands/xclaim
[XAUTOCLAIM]: https://redis.io/commands/xautoclaim
