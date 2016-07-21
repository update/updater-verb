'use strict';

var middleware = require('./lib/middleware');
var utils = require('./lib/utils');

module.exports = function(app, base, env) {

  app.task('verb', function() {
    return app.src('.verb*.md')
      .pipe(utils.through.obj(function(file, enc, next) {
        utils.del(file.path, function(err, files) {
          if (err) {
            next(err);
            return;
          }
          if (file.basename !== '.verb.md') {
            app.log.success('renamed', file.relative);
          }
          file.basename = '.verb.md';
          next(null, file);
        });
      }))
      .pipe(utils.series([
        middleware.lintDeps,
        middleware.htmlComments,
        middleware.install,
        middleware.related(base),
        middleware.reflinks(base),
        middleware.travis(base),
        middleware.jscomments,
        middleware.license,
        middleware.whitespace,
        middleware.toGithubUrl
      ]))
      .pipe(app.dest(app.cwd));
  });

  app.task('default', ['verb']);
};

function logger(msg) {
  return function(file, next) {
    console.log(msg + ' readme');
    next();
  };
}
