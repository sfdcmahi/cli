const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const config = require('./config');
const configstore = require('../../../lib/config');
const proc = require('../../../lib/process');
module.exports = function() {

  var keyName = configstore.name + '_rsa';
  var pathSSH = path.join(process.env.HOME, '.ssh');

  var pathKeyTarget = path.join(pathSSH, keyName);
  var pathPubTarget = pathKeyTarget + '.pub';

  var pathSSHConfig = path.join(pathSSH, 'config');
  var pathSSHHosts = path.join(pathSSH, 'known_hosts');

  return Promise.resolve()
    .then(function() {
      return fs.ensureFile(pathSSHHosts);
    })
    .then(function() {
      return proc.exec(`ssh-keygen -R ${config.host}`);
    })
    .then(function() {
      return proc.exec(`ssh-keyscan -H ${config.host} >> ${pathSSHHosts}`);
    })
    .then(function() {

      if (fs.existsSync(pathKeyTarget) &&
        fs.existsSync(pathPubTarget)
      ) {
        console.log('Keys already exist');
        return;
      }
      return require('../../secret/get').promise({
        secretKey: process.env.AGNETA_SECRET_KEY,
        props: ['keys.git.key', 'keys.git.pub']
      });
    })
    .then(function(secrets) {

      var keySource = secrets[0];
      var pubSource = secrets[1];

      if (!keySource ||
        !pubSource
      ) {
        throw new Error('Must have git rsa keys available to proceed');
      }

      return fs.outputFile(pathKeyTarget, keySource)
        .then(function() {
          return fs.outputFile(pathPubTarget, pubSource);
        });

    })
    .then(function() {
      return proc.exec(`chmod 600 ${pathKeyTarget}`);
    })
    .then(function() {
      return proc.exec(`chmod 600 ${pathPubTarget}`);
    })
    .then(function() {
      return fs.ensureFile(pathSSHConfig);
    })
    .then(function() {
      return fs.readFile(pathSSHConfig);
    })
    .then(function(content) {

      if (content.indexOf(keyName) >= 0) {
        console.log('SSH config entry already exists');
        return;
      }
      var host = config.remote.url.split(':')[0];
      host = host.split('@')[1];

      var entry = [
        '',
        '',
        `Host ${host} ${config.host}`,
        `Hostname ${config.host}`,
        `IdentityFile ~/.ssh/${keyName}`,
        `User ${config.username}`
      ].join('\n');

      content += entry;

      console.log('Add SSH config entry', entry);

      return fs.outputFile(pathSSHConfig, content);
    });

};
