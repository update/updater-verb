'use strict';

var isValid = require('is-valid-app');
var middleware = require('./lib/middleware');
var utils = require('./lib/utils');

module.exports = function(app) {
  if (!isValid(app, 'updater-verb')) return;

  app.task('verb', function() {
    var verbmd = app.options.verbmd || '.verb*.md';
    var filename = app.options.file || '.verb.md';

    return app.src(verbmd)
      .pipe(utils.through.obj(function(file, enc, next) {
        utils.del(file.path, function(err, files) {
          if (err) {
            next(err);
            return;
          }
          if (file.basename !== filename) {
            app.log.success('renamed', file.relative);
          }
          file.basename = filename;
          next(null, file);
        });
      }))
      .pipe(utils.series([
        middleware.lintDeps,
        middleware.htmlComments,
        middleware.install,
        middleware.related(app.base),
        middleware.reflinks(app.base),
        middleware.travis(app.base),
        middleware.jscomments,
        middleware.license,
        middleware.whitespace,
        middleware.toGithubUrl
      ]))
      .pipe(app.dest(app.cwd));
  });

  app.task('default', ['verb']);
};
