module.exports = function() {

  require('./ssh')()
    .then(function() {
      //require('./git')(app);
    });

};