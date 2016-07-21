'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var gm = require('global-modules');
var del = require('delete');
var copy = require('copy');
var generator = require('..');
var pkg = require('../package');
var app;

var cwd = path.resolve.bind(path, process.cwd());
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, re, cb) {
  if (typeof re === 'function') {
    cb = re;
    re = new RegExp(/./);
  }
  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      var str = fs.readFileSync(filepath, 'utf8');
      assert(re.test(str));
      cb();
    });
  };
}

describe('updater-verb', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function(cb) {
    app = generate({silent: true});
    app.cwd = actual();
    app.option('dest', actual());
    del(actual(), function(err) {
      if (err) return cb(err);
      copy(fixtures('*'), actual(), {dot: true}, function(err) {
        if (err) return cb(err);
        process.chdir(actual());
        cb();
      });
    });
  });

  afterEach(function(cb) {
    process.chdir(cwd());
    del(actual(), cb);
  });

  describe('tasks', function() {
    beforeEach(function() {
      app.use(generator);
    });

    it('should run the `default` task with .build', function(cb) {
      app.build('default', exists('.verb.md', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.generate('default', exists('.verb.md', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      beforeEach(function() {
        app.use(generator);
      });

      it('should run the default task using the `updater-verb` name', function(cb) {
        app.generate('updater-verb', exists('.verb.md', cb));
      });

      it('should run the default task using the `generator` generator alias', function(cb) {
        app.generate('verb', exists('.verb.md', cb));
      });
    });
  }

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('verb', generator);
      app.generate('verb', exists('.verb.md', cb));
    });

    it('should run the `verb` task', function(cb) {
      app.register('verb', generator);
      app.generate('verb:verb', exists('.verb.md', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('verb', generator);
      app.generate('verb:default', exists('.verb.md', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('verb', generator);
      });
      app.generate('foo.verb', exists('.verb.md', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('verb', generator);
      });
      app.generate('foo.verb', exists('.verb.md', cb));
    });

    it('should run the `verb:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('verb', generator);
      });
      app.generate('foo.verb:default', exists('.verb.md', cb));
    });

    it('should run the `verb:verb` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('verb', generator);
      });
      app.generate('foo.verb:verb', exists('.verb.md', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator)
      app.generate('foo.bar.baz', exists('.verb.md', cb));
    });
  });
});
