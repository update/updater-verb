'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('delete', 'del');
require('extend-shallow', 'extend');
require('fs-exists-sync', 'exists');
require('gulp-middleware', 'series');
require('through2', 'through');
require('union-value', 'union');
require = fn;

/**
 * Expose `utils` modules
 */

module.exports = utils;
