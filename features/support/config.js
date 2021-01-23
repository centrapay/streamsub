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

const convict = require('convict');
const json5 = require('json5');
const env = process.env['TEST_ENV'] || 'local';
const fs = require('fs');

convict.addParser({ extension: 'json5', parse: json5.parse });

const schema = {
  redis: {
    host: {
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST'
    },
    port: {
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT'
    },
  },
};

const config = convict(schema);
const configFiles = [
  'features/config.json5',
  `features/config-${env}.json5`
];

configFiles
  .filter(fs.existsSync)
  .forEach(f => config.loadFile(f));
config.validate({ allowed: 'strict' });

module.exports = config;
