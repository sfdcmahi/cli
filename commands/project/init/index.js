module.exports = function() {

  var options = {};
  require('./config')()
    .then(function(config) {
      options.config = config;
      return require('./output')(options);
    })
    .then(function() {
      return require('./secrets')(options);
    })
    .then(function() {
      return require('../../image/init').promise();
    })
    .then(function() {
      console.log('Your project is ready');
    });

};
