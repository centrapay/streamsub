'use strict';

module.exports = {
  default: `
    --format-options '${JSON.stringify({
    snippetInterface: 'async-await',
  })}'
    --tags 'not @ignore'
    --require features/support
  `,
};
