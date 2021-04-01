/*
 * Copyright 2021 Centrapay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const EventEmitter = require('events');
const promisifyRedis = require('./promisifyRedis');

function assertRequired(name, value) {
  if (!value) {
    throw new Error(`StreamSub "${name}" is required`);
  }
}

async function createConsumerGroup({ streamsub, subscriber }) {
  const stream = subscriber.topic;
  const group = subscriber.group;
  try {
    await streamsub.redis.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
    streamsub.emit('info', { msg: `StreamSub consumer group created: ${stream}/${group}` });
  } catch (err) {
    if (err.code == 'BUSYGROUP') {
      streamsub.emit('info', { msg: `StreamSub consumer group already exists: ${stream}/${group}` });
    } else {
      throw err;
    }
  }
}

async function startConsumer({ streamsub, subscriber }) {
  const stream = subscriber.topic;
  const group = subscriber.group;
  const consumer = streamsub.consumerId;
  const id = '>';
  streamsub.redisBlockingCount += 1;
  while(streamsub.running) {
    const data = await streamsub.redis.xreadgroup('GROUP', group, consumer, 'BLOCK', '5000', 'COUNT', 1, 'STREAMS', stream, id);
    if (data) {
      await subscriber.handler(data);
      // TODO acknowledge message
    }
  }
}

async function initSubscriber({ streamsub, subscriber }) {
  await createConsumerGroup({ streamsub, subscriber });
  setTimeout(startConsumer, 0, { streamsub, subscriber });
}

class StreamSub {

  constructor({ consumerId, redis }) {
    assertRequired('consumerId', consumerId);
    assertRequired('redis', redis);
    this.consumerId = consumerId;
    this.redis = promisifyRedis(redis);
    this.eventEmitter = new EventEmitter();
    this.subscribers = {};
    this.running = true;
    this.redisBlockingCount = 0;
  }

  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }

  emit(eventName, arg) {
    if (!['info', 'error'].includes(eventName)) {
      throw new Error(`Invalid event name: ${eventName}`);
    }
    this.eventEmitter.emit(eventName, arg);
  }

  async init() {
    const subscribers = this.subscribersList;
    this.emit('info', { msg: `StreamSub initializing ${subscribers.length} subscribers` });
    this.redisClientId = await this.redis.client('ID');
    await Promise.all(subscribers.map(s => initSubscriber({
      streamsub: this,
      subscriber: s,
    })));
  }

  async shutdown() {
    this.emit('info', { msg: 'StreamSub shutting down' });
    this.running = false;
    const redisControlClient = await this.redis.duplicate();
    for (let i = 0; i < this.redisBlockingCount; i++) {
      await redisControlClient.client('UNBLOCK', this.redisClientId);
    }
    await redisControlClient.quit();
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  get subscribersList() {
    return Object.values(this.subscribers).map(Object.values).flat();
  }

  register(subscriber) {
    const { topic, group } = subscriber;
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = {};
    }
    if (this.subscribers[topic][group]) {
      throw new Error(`StreamSub duplicate subscriber: ${topic}/${group}`);
    }
    this.subscribers[topic][group] = subscriber;
  }

  async publish({ topic, message }) {
    if (this.paused) {
      this.emit('info', { msg: 'StreamSub paused, ignoring message', topic });
      return;
    }
    await this.redis.xadd(topic, 'MAXLEN', '~', '100', '*', 'message', message);
  }
}

module.exports = StreamSub;
