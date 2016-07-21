'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Expose `middleware`
 */

var middleware = exports = module.exports;

/**
 * Update `related` helper arguments to the latest.
 *
 * @param {Object} `app` Instance of update
 */

middleware.related = function(app) {
  return function(file, next) {
    var pkg = app.pkg && app.pkg.data;
    if (!pkg) {
      next(new Error('middleware.related needs a package.json file'));
      return;
    }

    var str = file.contents.toString();
    str = extractTag(str, pkg.json, {
      prop: 'verb.related.list',
      tag: 'related'
    });

    file.contents = new Buffer(str);
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
    var pkg = app.pkg && app.pkg.data;
    if (!pkg) {
      next(new Error('middleware.reflinks needs a package.json file'));
      return;
    }

    var str = file.contents.toString();
    str = extractTag(str, pkg.json, {
      prop: 'verb.reflinks',
      tag: 'reflinks'
    });

    file.contents = new Buffer(str);
    next();
  };
};

/**
 * Update `related` helper arguments to the latest.
 */

middleware.jscomments = function(file, next) {
  var re = /\{%= (?:js)?comments\(['"](.*)['"]\) %}/;
  var str = file.contents.toString();
  file.contents = new Buffer(str.replace(re, '{%= apidocs(\'$1\') %}'));
  next();
};

/**
 * Update `related` helper arguments to the latest.
 */

middleware.license = function(file, next) {
  var re = /\{%= license\(.*\) %}/;
  var str = file.contents.toString();
  file.contents = new Buffer(str.replace(re, '{%= license %}'));
  next();
};

/**
 * Make sure "install" has a header
 */

middleware.install = function(file, next) {
  var str = file.contents.toString();
  var m = /\{%= include\(['"]install[^%]+\) %}/.exec(str);
  if (!m) return next();

  var prefix = str.slice(0, m.index).replace(/\s+$/, '');
  var suffix = str.slice(m.index);

  var last = prefix.split('\n').pop();
  if (/install/i.test(last)) {
    return next();
  }

  prefix += '\n\n## Install\n\n';
  file.contents = new Buffer(prefix + suffix);
  next();
};

/**
 * Strip lint deps comments from .verb.md
 */

middleware.lintDeps = function(file, next) {
  var re = /<!--\s*deps:\s*mocha\s*-->/;
  var str = file.contents.toString();
  if (re.test(str)) {
    file.contents = new Buffer(str.replace(re, ''));
  }
  next();
};

middleware.toGithubUrl = function(file, next) {
  if (file.basename !== 'README.md' && file.basename !== 'verb.md') {
    next();
    return;
  }

  var lines = file.contents.toString()
    .split('\n')
    .map(function(line) {
      var re = /(.*?\[.*?\]\()node_modules\/(.*?)\/(.*#L\d+\))/;
      var m = re.exec(line);

      if (m) {
        return '';
        // var str = m[1];
        // str += 'https:/github.com/jonschlinkert/';
        // str += m[2];
        // str += '/blob/master/';
        // str += m[3];
        // line = str;
      }
      return line;
    });

  file.contents = new Buffer(lines.join('\n'));
  next();
};

/**
 * Strip apidocs comments from .verb.md
 */

middleware.htmlComments = function(file, next) {
  var re = /<!--\s*add.*-->\n*/g;
  var str = file.contents.toString();
  if (re.test(str)) {
    file.contents = new Buffer(str.replace(re, ''));
  }
  next();
};

/**
 * Add a travis badge if the repo has `.travis.yml` and
 * no badge already exists.
 */

middleware.travis = function(app) {
  return function(file, next) {
    var cwd = app.cwd;
    if (!exists(cwd, '.travis.yml') && !exists(cwd, 'test') && !exists(cwd, 'test.js')) {
      next();
      return;
    }

    var snippet = '{%= badge("travis") %}';
    var str = file.contents.toString();
    if (/badge\(['"]travis['"]\)/.test(str)) {
      next();
      return;
    }

    if (hasLayout(str)) {
      next();
      return;
    }

    var lines = str.split('\n');
    lines[0] += ' ' + snippet;
    str = lines.join('\n');
    file.contents = new Buffer(str);
    next();
  };
};

/**
 * Ensure a single newline at the end of .verb.md
 */

middleware.whitespace = function(file, next) {
  file.contents = new Buffer(file.contents.toString().trim() + '\n');
  next();
};

/**
 * Utils
 */

function exists(cwd, filename) {
  return utils.exists(path.resolve(cwd, filename));
}

function hasLayout(str) {
  return !/^# /.test(str);
}

/**
 * Extract arguments from a tag in the given string.
 */

function extractTag(str, json, options) {
  json = json || {};
  var opts = utils.extend({}, options);
  if (!opts.prop) opts.prop = 'verb.' + opts.tag;

  var tokens = matchTags(str, opts.tag) || {};
  var token = tokens[opts.tag];
  if (token && token.args && token.args.length) {
    var keys = token.args[0];
    token.rawArgs.shift();

    if (Array.isArray(keys)) {
      utils.union(json, opts.prop, keys);
      var prepend = str.slice(0, token.loc.start);
      var append = str.slice(token.loc.end);
      var newTag = createTag(token, opts);
      return prepend + newTag + append;
    }
  }

  return str;
  // if the tag occurs more than once, we'll assume it's
  // because the user has defined different values for each
  // one

  // var matches = str.split('{%= ' + opts.tag);
  // if (matches.length > 2) {
  //   return str;
  // }

  // var reStr = '{%=[ \\t]*' + opts.tag + '\\(\\[(.*)\\].*\\)[ \\t]*%}';
  // var re = new RegExp(reStr);
  // var match = re.exec(str);

  // if (!match) return str;

  // // parse the array elements from the tag
  // var params = match[1];
  // if (params) {
  //   var keys = params.split(/[,'" ]+/).filter(Boolean);

  //   // add the array of items to `verb[prop]` in package.json
  //   union(json, opts.prop, keys);
  // }

  // // replace the array with a variable
  // return str.replace(re, createTag(opts.tag, opts.prop));
}

function createTag(token, opts) {
  var inner = opts.prop;
  if (token.rawArgs.length) {
    // remove extra parens we added earlier
    var args = token.rawArgs.map(function(arg) {
      return arg.replace(/^\(|\)$/g, '');
    });
    inner += ', ' + args.join(', ');
  }
  return '{%= ' + opts.tag + '(' + inner + ') %}';
}

function matchTags(str, tag) {
  var re = /{%=([\s\S]+?)%}/;
  var match = re.exec(str);
  var matches = {};
  var pos = 0;

  while (match) {
    var inner = match[1].trim();
    var idx = str.indexOf(match[0]);
    pos += idx;
    var len = match[0].length;
    str = str.slice(idx + len);
    var end = pos + len;

    var token = parseTag({
      loc: { start: pos, end: end },
      match: match,
      inner: inner
    });

    pos = end;
    matches[token.name] = token;
    match = re.exec(str);
  }
  return matches;
}

function parseTag(token) {
  parseName(token);
  parseArgs(token);
  return token;
}

function parseName(token) {
  var match = /^(\w+)/.exec(token.inner.trim());
  token.name = match[0];
  token.inner = token.inner.slice(token.name.length);
  return token;
}

function parseArgs(token) {
  var str = clean(token.inner.replace(/[\n\s]+/g, ' '));
  var segs = str.split(/,[ \t]*(?={)/);

  var rawArgs = token.inner.split(/,[ \t]*(?={)/).join(')!@!(').split('!@!');
  var len = rawArgs.length;
  var idx = -1;
  token.rawArgs = rawArgs;
  token.args = [];

  while (++idx < len) {
    var arg = rawArgs[idx].trim();
    var inside = arg.replace(/^\(|\)$/g, '');
    if (!inside || !/[\[\](){}]/.test(inside)) {
      continue;
    }
    var value = tryEval(arg);
    if (value) {
      token.args.push(value);
    }
  }
  delete token.inner;
  return token;
}

function clean(str) {
  return str.replace(/^['"\s(\[]+|[\])\s"']+$/g, '');
}

function tryEval(arg) {
  try {
    return eval('(function() {return ' + arg + ' }())');
  } catch (err) {
    // console.log('updater-verb: could not eval args: "%s"', arg);
  }
  return {};
}
