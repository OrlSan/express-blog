var express = require('express');
var passport = require('passport');
var async = require('async');
var router = express.Router();
var User = require('../models/User');
var Comment = require('../models/Comment');

router.get('/:commentId([0-z]{24})', function(req, res) {
  Comment.findOne({ "_id": req.params.commentId }, function(errSearch, comment) {
    if (errSearch || !comment) {
      res.status(409).json({
        success: false,
        message: "No existe el comentario con el ID " + req.params.commentId
      });
    }

    res.json(comment);
  });
});

// Edita un comentario siempre y cuando exista y
// seas el autor
router.put('/:commentId([0-z]{24})',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
  Comment.findOne({ "_id": req.params.commentId }, function(errSearch, comment) {
    if (errSearch || !comment) {
      return res.status(409).json({
        success: false,
        message: "No existe el comentario con el ID " + req.params.commentId
      });
    }

    // En este caso el usuario autenticado no es el autor
    if (comment.authorId != req.user._id) {
      res.status(403).json({
        success: false,
        message: "No puedes editar un comentario que no es tuyo"
      });
    }

    // Si no, entonces editamos el cuerpo del comentario
    comment.contents = req.body.contents;

    comment.save(function(errSave) {
      if (errSave) {
        return res.status(500).json({
          success: false,
          message: "Error en la base de datos. No se pudo guardar el comentario"
        });
      }

      return res.json({
        success: true,
        message: "El comentario fue actualizado exitosamente"
      });
    });
  })
});

router.delete('/:commentId([0-z]{24})',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    console.log(JSON.stringify(req.user));
    Comment.findOne({ "_id": req.params.commentId }, function(errSearch, comment) {
      if (errSearch || !comment) {
        return res.status(404).json({
          success: false,
          message: "No existe el comentario con el ID " + req.params.commentId
        });
      }

      console.log("Author ID " + comment.authorId)
      if (comment.authorId != req.user._id) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para borrar este comentario"
        });
      }

      comment.remove(function(errRemove) {
        if (errRemove) {
          return res.status(404).json({
            success: false,
            message: "No se pudo borrar el comentario: " + errRemove
          });
        }

        res.json({
          success: true,
          message: "Ok"
        });
      })

    });
  });

module.exports = router;
