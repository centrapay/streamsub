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

const { promisify } = require('util');

function wrap(client, op) {
  return promisify(client[op]).bind(client);
}

function promisifyRedis(client) {
  return {
    /* Basic */
    get: wrap(client, 'get'),
    set: wrap(client, 'set'),

    /* Stream */
    xadd: wrap(client, 'xadd'),
    xread: wrap(client, 'xread'),
    xdel: wrap(client, 'xdel'),
    xlen: wrap(client, 'xlen'),

    /* Stream Consumer Group */
    xgroup: wrap(client, 'xgroup'),
    xinfo: wrap(client, 'xinfo'),
    xpending: wrap(client, 'xpending'),
    xreadgroup: wrap(client, 'xreadgroup'),
    xack: wrap(client, 'xack'),
    xclaim: wrap(client, 'xclaim'),
    xautoclaim: () => { throw Error('xautoclaim not implemented'); },

    /* Connection */
    quit: wrap(client, 'quit'),
  };
}

module.exports = promisifyRedis;
