
require('path');
require('path').resolve;

try {
  require('uninstalled-external-module');
} catch (ignored) {
  /* ignore */
}

const fs = require('fs');
const readFile = require('fs').readFile;
const { stat, cp: cpAlias } = require('fs');

const modules = [
  require('@angular/core'),
  require('@angular/core').default,
];

const json = {
  a: require('./a'),
  b: require('./b').b,
};

const routes = [
  {
    name: 'Home',
   	component: require('./Home.vue'),
  },
];

function load(path) {
  require(path);
}

