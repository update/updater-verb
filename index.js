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
 * Update `related` helper arguments to the latest.
 *
 * @param {[type]} base
 * @return {[type]}
 */

middleware.related = function(base) {
  return function(file, next) {
    var re = /\{%= related\((?:(\[(.*)\])|(.*))\) %}/;
    var str = file.content;
    var m = re.exec(str);

    if (!m) return next();

    if (m[2] && m[1]) {
      var keys = m[2].split(/[,'" ]+/).filter(Boolean);
      var pkg = base.getFile('package.json');
      union(pkg.json, 'verb.related.list', keys);
      file.content = str.split(m[1]).join('verb.related.list');
    } else if (m[3]) {
      file.content = str.split(m[3]).join('verb.related.list');
    }
    next();
  };
};

/**
 * Update `related` helper arguments to the latest.
 *
 * @param {[type]} base
 * @return {[type]}
 */

middleware.jscomments = function(file, next) {
  var re = /\{%= (?:js)?comments\(['"](.*)['"]\) %}/;
  file.content = file.content.replace(re, '{%= apidocs(\'$1\') %}');
  next();
};

/**
 * Make sure "install" has a header
 */

middleware.install = function(file, next) {
  var str = file.content;
  var idx = str.indexOf('{%= include("install');
  var prefix = str.slice(0, idx).replace(/\s+$/, '');
  var suffix = str.slice(idx);
  var last = prefix.split('\n').pop();
  if (!/## Install/.test(last)) {
    prefix += '\n\n## Install\n\n';
    file.content = prefix + suffix;
  }
  next(null, file);
};

/**
 * Strip lint deps comments from .verb.md
 */

middleware.lintDeps = function(file, next) {
  var re = /<!--\s*deps:\s*mocha\s*-->/;
  if (re.test(file.content)) {
    file.content = file.content.replace(re, '');
  }
  next();
};

/**
 * Add a travis badge if the repo has `.travis.yml` and
 * no badge already exists.
 */

middleware.travis = function(base) {
  return function(file, next) {
    if (!base.getFile('.travis.yml')) {
      return next();
    }

    var snippet = '{%= badge("travis") %}';
    var str = file.content;
    var idx = str.indexOf(snippet);
    if (idx !== -1) return next();

    if (!hasTests(base.views.files)) {
      return next();
    }

    var lines = str.split('\n');
    lines[0] += ' ' + snippet;
    str = lines.join('\n');
    file.content = str;
    next();
  };
};

/**
 * Ensure a single newline at the end of .verb.md
 */

middleware.whitespace = function(file, next) {
  file.content = file.content.trim();
  file.content += '\n';
  next();
};

/**
 * Utils
 */

function hasTests(files) {
  for (var key in files) {
    if (/test/.test(key)) {
      return true;
    }
  }
  return false;
}
