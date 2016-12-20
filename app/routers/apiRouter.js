var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
  if (req.headers.authentication != "") {
    if (req.headers.authentication === "OAuth ZEGCM33CMRqc28tLoMp5") {
      return next();
    }
  }

  if (req.query.token != "") {
    if (req.query.token === "ZEGCM33CMRqc28tLoMp5") {
      return next();
    }
  }

  if (req.body.token === "ZEGCM33CMRqc28tLoMp5") {
    return next();
  }

  res.status(401).json({
    success: false,
    message: "No estás autorizado"
  });
});

router.get('/', function(req, res) {
  res.json({
    success: true,
    message: "Bienvenido a la API!"
  });
});

router.post('/', function(req, res) {
  res.json({
    success: true,
    message: "Recibida petición POST"
  });
});

router.get('/users/:userID', function(req, res) {
  res.json({
    id: req.params.userID,
    name: "Orlando"
  });
});

module.exports = router;
