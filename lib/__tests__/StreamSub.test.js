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


const StreamSub = require('../StreamSub');
const createRedisClientStub = require('./createRedisClientStub');

describe('StreamSub', () => {

  describe('constructor', () => {

    test('requires redis client', () => {
      expect(() => {
        new StreamSub({
          consumerId: 'foo',
        });
      }).toThrow('StreamSub "redisClient" is required');
    });

    test('requires consumer id', () => {
      expect(() => {
        new StreamSub({
          redisClient: createRedisClientStub(),
        });
      }).toThrow('StreamSub "consumerId" is required');
    });

  });

  describe('init', () => {

    test('cannot init twice', async () => {
      const redisClient = createRedisClientStub();
      const consumerId = 'consumer-1';
      const streamsub = new StreamSub({ redisClient, consumerId });
      await streamsub.init();
      await expect(streamsub.init()).rejects.toThrow('StreamSub already initialized');
    });

  });

});
