const path = require('path');
const config = require('../../lib/config');
const os = require('os');

var user = os.userInfo();

user.username = 'agneta';
user.uid = user.uid || 1000;
user.gid = user.gid || 1000;

var home = `/home/${user.username}`;
var pathCache = '.cache';


var data = {
  name: config.name,
  domain: {
    portal: 'portal.localhost',
    live: 'live.localhost'
  },
  image: {
    base: 'agneta:latest',
    app: `${config.name}:latest`,
    proxy: `${config.name}-proxy:latest`,
  },
  path: {
    ouput: path.join(process.cwd(),'.image'),
    cache: pathCache,
    npmCache: `${pathCache}/npm.tgz`,
    cliCache: `${pathCache}/cli.tgz`,
    home: home,
    app: `${home}/app`,
    projectCli: path.join(__dirname, '../..'),
  },
  serverName: config.agneta.get('server.name'),
  user: user,
  portHttp: {
    portal: 8181,
    live: 8282
  },
  port: {
    portal: 9191,
    live: 9292
  },
  commands: {}
};

data.path.projectPlatform = config.agneta.get('platform');

data.volumes = [
  '',
  `      - .:${data.path.app}`,
  `      - ${data.path.projectCli}:/usr/local/lib/node_modules/agneta-cli`,
  `      - ${data.path.projectPlatform}:${data.path.app}/node_modules/agneta-platform`,
  `      - ${data.path.app}/node_modules/uws`,
  `      - ${data.path.app}/node_modules/agneta-platform/node_modules/uws`
].join('\n');


module.exports = data;
