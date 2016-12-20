var express = require('express');
var router = express.Router();
var User = require('../models/User');
var passport = require('passport');
// var authMiddleware = require("../../authMiddleware");

// Obtiene algo de la forma /byId/5859683e54cd6509bf886308
// router.get('/:idUser^(byId\/)[0-z]{24}$/', function(req, res) {
//   User
//     .findOne({ "_id" : req.params.idUser })
//     .select('email name')
//     .exec(function(errSearch, user) {
//     if (errSearch) {
//       return res.status(500).json({
//         success: false,
//         message: "Error en la base de datos: " + errSearch
//       });
//     }
//
//     res.json(user);
//   });
// });

router.post('/', function(req, res) {
  console.log("Request body: " + JSON.stringify(req.body));

  User.findOne({ email: req.body.email }, function(errSearch, foundUser) {
    if (errSearch) {
      return res.status(500).json({
        success: false,
        message: "Error en la base de datos: " + errSearch
      });
    }

    if (foundUser) {
      return res.status(409).json({
        success: false,
        message: "Already in the database"
      });
    }

    User.genHash(req.body.password, function(errHash, hash) {
      var newUser = new User({
        email: req.body.email,
        name: req.body.name,
        password: hash
      });

      newUser.save(function(errSave) {
        if (errSave) {
          return res.status(500).json({
            success: false,
            message: "Error al guardar: " + errSave
          });
        }

        res.json({
          success: true,
          message: "El usuario fue creado exitosamente"
        });
      });
    });
  });
});

// Requerimos `email` y `password` en la petición
router.post('/login', function(req, res) {
  User.findOne({ "email": req.body.email }, function(errSearch, foundUser) {
    if (errSearch) {
      return res.status(500).json({
        success: false,
        message: "Ocurrió un error en la base de datos: " + errSearch
      });
    }

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Revisa tus datos e intenta de nuevo"
      });
    }

    // Verificamos si el password es válido
    foundUser.isValidPass(req.body.password, function(errPass, isValid) {
      if (errPass) {
        return res.status(500).json({
          success: false,
          message: "Ocurrió un error en la base de datos: " + errPass
        });
      }

      // Si la contraseña es válida entonces generamos un token y
      // lo regresamos en la respuesta
      if (isValid) {
        foundUser.saveNewToken(function(errToken, newToken) {
          if (errToken) {
            return res.status(500).json({
              success: false,
              message: "Ocurrió un error en el servidor: " + errToken
            });
          }

          return res.json({
            success: true,
            message: "Login correcto",
            token: newToken
          });
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Revisa tus datos e intenta de nuevo"
        });
      }
    });
  });
});

router.get('/authRoute',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json({ success: true, message: "Orlando Rules", user: req.user });
  });

module.exports = router;
