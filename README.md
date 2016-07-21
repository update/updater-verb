# updater-verb [![NPM version](https://img.shields.io/npm/v/updater-verb.svg?style=flat)](https://www.npmjs.com/package/updater-verb) [![NPM downloads](https://img.shields.io/npm/dm/updater-verb.svg?style=flat)](https://npmjs.org/package/updater-verb) [![Build Status](https://img.shields.io/travis/update/updater-verb.svg?style=flat)](https://travis-ci.org/update/updater-verb)

Update a .verb.md file to use the latest conventions and fix formatting mistakes or incompatibilities.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [What is "Update"?](#what-is-update)
- [Community](#community)
- [About](#about)
  * [Related projects](#related-projects)
  * [Contributing](#contributing)
  * [Running tests](#running-tests)
  * [Author](#author)
  * [License](#license)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install

**Install update**

If you haven't already installed [update](https://github.com/update/update) globally, you can do that now with the following command:

```sh
$ npm install --global update
```

This adds `update` to your system path, allowing it to be run from any directory.

**Install updater-verb**

Install this module with the following command:

```sh
$ npm install --global updater-verb
```

## Usage

Make sure your work is committed, then run the updater's `default` [task](https://github.com/update/update/blob/master/docs/tasks.md#default-task) with the following command:

```sh
$ update verb
```

**What will happen?**

This updater's `default` task will:

* rename old `.verbrc.md` files to `.verb.md`
* replace the old `{%= license() %}` helper syntax with the `{%= license %}` variable
* a handful of other verb-specific things you can find in [the code](lib/middleware.js)

## What is "Update"?

Update is a new, open source developer framework and CLI for automating updates of any kind in code projects. For more information:

* Visit the [update project](https://github.com/update/update)
* Visit the [update documentation](https://github.com/update/update)
* Find [updaters on npm](https://www.npmjs.com/browse/keyword/update-updater) (help us [author updaters](https://github.com/update/update/blob/master/docs/updaters.md))

## Community

Are you using Update in your project? Have you published an [updater](docs/updaters.md) and want to share your Update project with the world? Here are some suggestions:

* If you get like Update and want to tweet about it, please use the hashtag `#updatejs`
* Get implementation help on [StackOverflow](http://stackoverflow.com/questions/tagged/update) (please use the `update` tag in questions)
* **Gitter** Discuss Update with us on [Gitter](https://gitter.im/update)
* If you publish an updater, thank you! To make your project as discoverable as possible, please add the keyword `updateupdater` to package.json.

## About

### Related projects

[update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update "Be scalable! Update is a new, open source developer framework and CLI for automating updates of any kind in code projects.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

### License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/update/updater-verb/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on July 21, 2016._