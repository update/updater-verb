'use strict';

var union = require('union-value');
var isFalse = require('is-false');
var rimraf = require('rimraf');

/**
 * Expose `middleware`
 */

var middleware = module.exports;

/**
 * Rename ".verbrc.md" files to ".verb.md"
 */

middleware.verbrc = function(file, next) {
  file.path = '.verb.md';
  rimraf('.verbrc.md', function (err) {
    if (err) return next(err);
    next(null, file);
  });
};

/**
 * Update the dest path for ".verb.md" files to "readme.md"
 */

middleware.verbmd = function(file, next) {
  if (isFalse(file, 'readme')) return next();
  file.path = 'readme.md';
  next();
};

/**
 * Update `related` helper arguments to the latest.
 *
 * @param {[type]} base
 * @return {[type]}
 */

middleware.related = function(base) {
  return function(view, next) {
    var re = /\{%= related\((?:(\[(.*)\])|(.*))\) %}/;
    var str = view.content;
    var m = re.exec(str);

    if (!m) return next();

    if (m[2] && m[1]) {
      var keys = m[2].split(/[,'" ]+/).filter(Boolean);
      var pkg = base.files.getView('package.json');
      union(pkg.json, 'verb.related.list', keys);
      view.content = str.split(m[1]).join('verb.related.list');
    } else if (m[3]) {
      view.content = str.split(m[3]).join('verb.related.list');
    }
    next();
  };
};

/**
 * Make sure "install" has a header
 * TODO:
 *
 * ## Install
 * {%= include
 */

// middleware.install = function(file, next) {
//   if (isFalse(file, 'readme')) return next();
//   file.path = 'readme.md';
//   next();
// };

/**
 * Add a travis badge if the repo has `.travis.yml`
 */

// middleware.travis = function(file, next) {
//   if (isFalse(file, 'readme')) return next();
//   file.path = 'readme.md';
//   next();
// };
