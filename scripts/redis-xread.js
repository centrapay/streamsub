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

const stream = process.argv[2];
const id = process.argv[3];

if (!stream) {
  errorExit('Missing arg 1: stream');
}

if (!id) {
  errorExit('Missing arg 2: id');
}

async function main() {
  const redis = require('./redis-async-client');
  const data = await redis.xread('STREAMS', stream, id);
  await redis.quit();
  return require('util').inspect(data, null, null);
}

main()
  .catch(errorExit)
  .then(console.log);
