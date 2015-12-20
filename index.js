'use strict';

var extend = require('extend-shallow');
var union = require('union-value');
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
  rimraf('.verbrc.md', function(err) {
    if (err) return next(err);
    next(null, file);
  });
};

/**
 * Update `related` helper arguments to the latest.
 *
 * @param {Object} `app` Instance of update
 */

middleware.related = function(app) {
  return function(file, next) {
    var pkg = app.getFile('package.json');
    if (!pkg) {
      next(new Error('middleware.related needs a package.json file'));
      return;
    }

    file.content = extractTag(file.content, pkg.json, {
      prop: 'verb.related.list',
      tag: 'related'
    });

    next();
  };
};

/**
 * Update `reflinks` helper arguments to the latest.
 *
 * @param {Object} `app` Instance of `update`
 */

middleware.reflinks = function(app) {
  return function(file, next) {
    var pkg = app.getFile('package.json');
    if (!pkg) {
      next(new Error('middleware.reflinks needs a package.json file'));
      return;
    }

    file.content = extractTag(file.content, pkg.json, {
      prop: 'verb.reflinks',
      tag: 'reflinks'
    });
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
 * Update `related` helper arguments to the latest.
 *
 * @param {[type]} base
 * @return {[type]}
 */

middleware.license = function(file, next) {
  var re = /\{%= license\(.*\) %}/;
  file.content = file.content.replace(re, '{%= license %}');
  next();
};

/**
 * Make sure "install" has a header
 */

middleware.install = function(file, next) {
  var str = file.content;
  var m = /\{%= include\(['"]install[^%]+\) %}/.exec(str);
  if (!m) return next();

  var prefix = str.slice(0, m.index).replace(/\s+$/, '');
  var suffix = str.slice(m.index);

  var last = prefix.split('\n').pop();
  if (!/^#+ Install/gm.test(last)) {
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
 * Strip apidocs comments from .verb.md
 */

middleware.htmlComments = function(file, next) {
  var re = /<!--\s*add.*-->\n*/g;
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

    if (hasLayout(str)) {
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

function hasLayout(str) {
  return !/^# /.test(str);
}

/**
 * Extract arguments from a tag in the given string.
 */

function extractTag(str, json, options) {
  var opts = extend({}, options);
  if (!opts.prop) opts.prop = 'verb.' + opts.tag;

  // if the tag occurs more than once, we'll assume it's
  // because the user has defined different values for each
  // one,
  var matches = str.split('{%= ' + opts.tag);
  if (matches.length > 2) {
    return str;
  }

  var reStr = '{%= ' + opts.tag + '\\(\\[(.*)\\].*\\) %}';
  var re = new RegExp(reStr);
  var match = re.exec(str);
  if (!match) return str;


  // parse the array elements from the tag
  var params = match[1];
  if (params) {
    var keys = params.split(/[,'" ]+/).filter(Boolean);

    // add the array of items to `verb[prop]` in package.json
    union(json, opts.prop, keys);
  }

  // replace the array with a variable
  var res = '{%= ' + opts.tag + '(' + opts.prop + ') %}';
  return str.replace(re, res);
}
