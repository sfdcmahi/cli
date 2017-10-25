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

  return Promise.resolve()

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

      var line = '/.cache/';

      if (content.indexOf(line) < 0) {
        throw new Error(`Your .gitignore should have this line: ${line}`);
      }
      var contentOutput = content.toString().replace(line, '');

      var pathOuput = path.join(
        process.cwd(),
        '.dockerignore'
      );

      return fs.outputFile(pathOuput, contentOutput);

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
