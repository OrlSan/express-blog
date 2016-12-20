var Strategy = require('passport-http-bearer').Strategy;
var User = require('./app/models/User');

module.exports = new Strategy(function(token, cb) {
  User.findOne({ token: token })
      .select('id email')
      .lean()
      .exec(cb);
});
