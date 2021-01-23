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

const uuid = require('uuid');
const glob = require('glob');
const cucumber = require('@cucumber/cucumber');
const expect = require('expect');
const waitOn = require('wait-on');
const redis = require('redis');
const config = require('./config');
const promisifyRedis = require('../../lib/promisifyRedis');

global.expect = expect;
global.Given = cucumber.Given;
global.When = cucumber.When;
global.Then = cucumber.Then;
global.Before = cucumber.Before;
global.After = cucumber.After;

class World {

  constructor() {
    this.config = config;
    this.redisClients = [];
  }

  get testId(){
    return `${this.runId}-${this.scenarioId}`;
  }

  createRedisClient() {
    const client = redis.createClient({
      host: this.config.get('redis.host'),
      port: this.config.get('redis.port'),
    });
    client.on('error', console.error);
    this.redisClients.push(client);
    return client;
  }

}

cucumber.setWorldConstructor(World);

const runId = uuid.v4();

cucumber.Before(async function(scenario){
  this.runId = runId;
  this.scenarioId = scenario.pickle.name.replace(/ /g, '-').toLowerCase();
});

cucumber.After(async function(){
  await Promise.all(this.redisClients
    .map(promisifyRedis)
    .map(r => r.quit())
  );
});

cucumber.BeforeAll(async function () {
  const redisHost = config.get('redis.host');
  const redisPort = config.get('redis.port');
  await waitOn({
    resources: [
      `tcp:${redisHost}:${redisPort}`,
    ],
    timeout: 5000,
    verbose: true
  });
});

glob.sync('../**/steps/**/*.js', { cwd: __dirname }).forEach(require);
