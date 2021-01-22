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

global.expect = expect;
global.Given = cucumber.Given;
global.When = cucumber.When;
global.Then = cucumber.Then;
global.Before = cucumber.Before;
global.After = cucumber.After;

class World {

  get testId(){
    return `${this.runId}-${this.scenarioId}`;
  }

}

cucumber.setWorldConstructor(World);

const runId = uuid.v4();

cucumber.Before(async function(scenario){
  this.runId = runId;
  this.scenarioId = scenario.pickle.name.replace(/ /g, '-').toLowerCase();
});

cucumber.BeforeAll(async function () {
  const redisHost = 'redis';
  const redisPort = '6379';
  await waitOn({
    resources: [
      `tcp:${redisHost}:${redisPort}`,
    ],
    timeout: 5000,
    verbose: true
  });
});

glob.sync('../**/steps/**/*.js', { cwd: __dirname }).forEach(require);
