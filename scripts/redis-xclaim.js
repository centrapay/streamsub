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

const stream = process.argv[2] || errorExit('Missing arg 1: stream');
const group = process.argv[3] || errorExit('Missing arg 2: group');
const consumer = process.argv[4] || errorExit('Missing arg 3: consumer');
const idle = process.argv[5] || errorExit('Missing arg 4: idle');
const id = process.argv[6] || errorExit('Missing arg 5: id');

async function main() {
  const redis = require('./redisAsyncClient');
  const result = await redis.xclaim(stream, group, consumer, idle, id);
  await redis.quit();
  return require('util').inspect(result, null, null);
}

main()
  .catch(errorExit)
  .then(console.log);
