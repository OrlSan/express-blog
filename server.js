var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');
var mongoose = require('mongoose');
var authStrategy = require('./authStrategy');

// Importamos la configuración
var config = require('./config');

// Conectamos la base de datos
mongoose.connect(config.mongoose.url, function(errConnection) {
  if (errConnection) {
    console.log("ERROR AL CONECTAR A LA BASE DE DATOS");
  } else {
    console.log("Conectado a la base de datos");
  }
});

// Importamos los routers
var userRouter = require('./app/routers/userRouter');
var postRouter = require('./app/routers/postRouter');
var commentsRouter = require('./app/routers/commentsRouter');

// Dependencias de la aplicación
app.use(bodyParser.json());
app.use(logger('dev'));
app.set('view engine', 'pug');

// Configuramos Passport con nuestra estrategia
passport.use(authStrategy);

app.get('/', function(req, res) {
  res.render('index.pug', {
    title: "Bienvenido",
    message: "Página de inicio"
  });
});

app.get('/authRoute',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json(req.user);
});

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentsRouter);

app.listen(config.port, function() {
  console.log("Escuchando en el puerto " + config.port);
});
