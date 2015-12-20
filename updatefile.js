'use strict';

var utils = require('middleware-utils');
var middleware = require('./');

module.exports = function(app, base, env) {
  // rename `.verbrc.md` to `.verb.md`
  base.onLoad(/\.verbrc\.md$/, utils.series([
    middleware.verbrc,
  ]));

  function logger(file, next) {
    base.log('updating readme');
    next();
  }

  base.onStream(/\.(verb|readme)\.md$/i, utils.series([
    logger,
    middleware.lintDeps,
    middleware.htmlComments,
    middleware.install,
    middleware.related(base),
    middleware.reflinks(base),
    middleware.travis(base),
    middleware.jscomments,
    middleware.license,
    middleware.whitespace
  ]));
};
