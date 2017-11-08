const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

function promise(argv) {

  var composeData = {
    config: config,
  };
  var templateOptions = {
    interpolate: /<%-([\s\S]+?)%>/g
  };

  require('./commands')(argv);

  config.image = argv.image || config.image;

  return Promise.resolve()

    .then(function() {

      var name = 'entrypoint.sh';
      var outputFile = path.join(process.cwd(), name);

      return fs.copy(
          path.join(__dirname, name),
          outputFile
        )
        .then(function() {
          return fs.chmod(outputFile, '0700');
        });
    })
    //-------------------------------------------------------------------
    // Generate dockerfile
    .then(function() {

      return fs.readFile(
        path.join(__dirname, 'dockerfile')
      );

    })
    .then(function(content) {

      var template = _.template(content, templateOptions);
      var contentOutput = template({
        config: config
      }, templateOptions);

      var pathOuput = path.join(
        process.cwd(),
        'dockerfile'
      );

      return fs.outputFile(pathOuput, contentOutput);

    })
    .then(function() {
      console.log('Generated build file');
    })
    //---------------------------------------------------------------
    // Generate compose file
    .then(function() {

      return fs.readFile(
        path.join(__dirname, 'compose.yml')
      );

    })
    .then(function(content) {

      var template = _.template(content, templateOptions);
      var contentOutput = template(composeData, templateOptions);

      var pathOuput = path.join(
        process.cwd(),
        'docker-compose.yml'
      );

      return fs.outputFile(pathOuput, contentOutput);

    })
    .then(function() {
      console.log('Generated compose file');
    })
    //---------------------------------------------------------------
    // Generate Docker Ignore file
    .then(function() {

      return fs.readFile(
        path.join(
          process.cwd(),
          '.gitignore'
        )
      );

    })
    .then(function(content) {

      var lines = ['/.cache/'];

      for (var line of lines) {

        if (content.indexOf(line) < 0) {
          throw new Error(`Your .gitignore should have this line: ${line}`);
        }
        content = content.toString().replace(line, '');
      }

      var pathOuput = path.join(
        process.cwd(),
        '.dockerignore'
      );

      return fs.outputFile(pathOuput, content);

    })
    //---------------------------------------------------------------
    // Generate Docker Ignore file
    .then(function() {

      return fs.readFile(
        path.join(__dirname, 'buildspec.yml')
      );

    })
    .then(function(content) {

      var pathOuput = path.join(
        process.cwd(),
        'buildspec.yml'
      );

      return fs.outputFile(pathOuput, content);

    });


}

module.exports = {
  cmd: function(yargs) {

    var argv = yargs
      .options({
        mode: {
          alias: 'm',
          describe: 'Select build mode',
          choices: ['development', 'portal'],
          default: 'development'
        }
      }).argv;

    promise(argv);

  },
  promise: promise
};
