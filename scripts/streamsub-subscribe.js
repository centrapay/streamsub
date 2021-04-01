#!/usr/bin/env node

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

function errorExit(err) {
  console.error(err);
  process.exit(1);
}

async function waitForInterrupt() {
  let interrupted = false;
  function checkForInterrupt(resolve) {
    if (interrupted) {
      resolve();
    } else {
      setTimeout(checkForInterrupt, 200, resolve);
    }
  }
  process.on('SIGINT', () => interrupted = true);
  return new Promise(checkForInterrupt);
}


const topics = process.argv.slice(2);
const consumerGroups = [ 'test-subscriber-1', 'test-subscriber-2' ];

if (!topics.length) {
  errorExit('At least one topic is required');
}

function loggingSubscriber({ topic, group }) {
  return {
    topic,
    group,
    handler(message) {
      console.log(require('util').inspect({ topic, group, message }, null, null));
    },
  };
}

async function main() {
  const redis = require('./redisAsyncClient');
  const StreamSub = require('../lib/StreamSub');
  const streamsub = new StreamSub({
    consumerId: `scripts/streamsub-subscribe/${require('os').hostname()}`,
    redis,
  });
  topics.forEach(topic => {
    consumerGroups.forEach(group => {
      streamsub.register(loggingSubscriber({ topic, group }));
    });
  });
  streamsub.on('info', console.log);
  streamsub.on('error', console.error);
  await streamsub.init();
  await waitForInterrupt();
  await streamsub.shutdown();
  await redis.quit();
}

main()
  .catch(errorExit);
