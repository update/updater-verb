'use strict';

var utils = require('middleware-utils');
var middleware = require('./');

module.exports = function(app, base, env) {
  // rename `.verbrc.md` to `.verb.md`
  base.onLoad(/\.verbrc\.md$/, middleware.verbrc);

  base.onStream(/\.(verb|readme)\.md$/i, utils.series([
    middleware.verbmd,
    middleware.related(base)
  ]));
};
