var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var randomstring = require("randomstring");

var userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  name: {
    type: String
  },
  password: {
    type: String
  },
  token: { // El token de la sesión asociada al usuario
    type: String
  }
});

userSchema.static.auth = function(req, res, next) {
  if (req.headers.authorization) {
    this.findOne({ token: req.headers.authorization.substring(8) })
        .select('id email')
        .lean()
        .exec(function(errSearch, foundUser) {
          if (errSearch) {
            return res.status(500).json({
              success: false,
              message: "Error en la base de datos"
            });
          }

          req.user = foundUser;
          next();
        });
  }
};

userSchema.statics.genHash = function(plainPassword, callback) {
  bcrypt.hash(plainPassword, 10, callback);
};

userSchema.methods.isValidPass = function(inputPass, callback) {
  bcrypt.compare(inputPass, this.password, callback);
};

userSchema.methods.saveNewToken = function(callback) {
  var newToken = randomstring.generate();
  this.token = newToken;

  this.save(function(errSave) {
    if (errSave) {
      return callback(errSave);
    }

    return callback(null, newToken);
  });
};

module.exports = mongoose.model('User', userSchema);
