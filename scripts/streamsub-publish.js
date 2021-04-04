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

const topic = process.argv[2] || errorExit('Missing arg 1: topic');
const message = process.argv[3] || errorExit('Missing arg 2: message');

async function main() {
  const redisClient = require('./redisAsyncClient');
  const StreamSub = require('../lib/StreamSub');
  const streamsub = new StreamSub({
    consumerId: `scripts/streamsub-publish/${require('os').hostname()}`,
    redisClient,
  });
  streamsub.on('info', console.log);
  streamsub.on('error', console.error);
  await streamsub.publish({ topic, message });
  await redisClient.quit();
}

main()
  .catch(errorExit);
