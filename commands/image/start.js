const proc = require('../lib/process');

module.exports = function() {

  proc.exec('docker-compose up -d dev')
    .then(function() {

      var terminal = 'x-terminal-emulator -e "docker-compose exec dev bash -c';

      proc.exec(`${terminal} 'tail -n 1000 -f .pm2/logs/output-0.log'"`);
      proc.exec(`${terminal} 'tail -n 1000 -f .pm2/logs/error-0.log'"`);
      proc.exec(`${terminal} 'pm2 list; exec /bin/bash -i'"`);
    });

};