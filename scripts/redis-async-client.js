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

const redis = require('redis');
const client = redis.createClient();

client.on('error', console.error);

const { promisify } = require('util');

function wrap(op) {
  return promisify(client[op]).bind(client);
}

module.exports = {
  get: wrap('get'),
  set: wrap('set'),
  xadd: wrap('xadd'),
  xread: wrap('xread'),
  quit: wrap('quit')
};
