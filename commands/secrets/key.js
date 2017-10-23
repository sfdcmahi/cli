const inquirer = require('inquirer');
const config = require('../../lib/config');
const cryptojs = require('crypto-js');
const Promise = require('bluebird');

function promise() {

  var tries = 0;

  function tryGet() {


    return Promise.resolve()
      .then(function() {
        return inquirer.prompt([{
          type: 'password',
          name: 'passphrase',
          message: 'Enter a passphrase to decrypt the generated secret key'
        }]);
      })
      .then(function(answers) {

        var secretKey = config.get('secretKey');
        secretKey = cryptojs.AES.decrypt(secretKey, answers.passphrase);

        try {
          secretKey = secretKey.toString(cryptojs.enc.Utf8);
        } catch (err) {
          secretKey = null;
        }

        if (!secretKey) {
          tries++;
          console.error(`The passphrase is invalid. try again... tries: [${tries}]`);
          if (tries > 2) {
            throw new Error('Passphrase incorrect');
          }
          return tryGet();
        }

        return secretKey;
      });
  }


  return tryGet();
}

module.exports = {
  command: function() {
    promise()
      .then(function(secretKey) {
        console.log(`Secret key is ${secretKey}`);
      });
  },
  promise: promise
};
