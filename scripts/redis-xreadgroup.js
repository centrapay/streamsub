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

const group = process.argv[2] || errorExit('Missing arg 1: group');
const consumer = process.argv[3] || errorExit('Missing arg 2: consumer');
const count = process.argv[4] || errorExit('Missing arg 3: count');
const streamsAndIds = process.argv.slice(5);

if (streamsAndIds.length < 2) {
  errorExit('Missing args: at least one stream and message id are required');
}

async function main() {
  const redis = require('./redisAsyncClient');
  const data = await redis.xreadgroup('GROUP', group, consumer, 'BLOCK', '5000', 'COUNT', count, 'STREAMS', ...streamsAndIds);
  await redis.quit();
  return require('util').inspect(data, null, null);
}

main()
  .catch(errorExit)
  .then(console.log);
