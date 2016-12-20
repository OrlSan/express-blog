var express = require('express');
var passport = require('passport');
var async = require('async');
var router = express.Router();
var Post = require('../models/Post');
var User = require('../models/User');
var Comment = require('../models/Comment');

router.get('/', function(req, res) {
  Post
    .find({})
    .sort({ "date": -1 })
    .exec(function(errSearch, posts) {
      if (errSearch) {
        return res.status(500).json({
          success: false,
          message: "Error en la base de datos: " + errSearch
        });
      }

      async.map(posts, function(post, next) {
        User.findOne({ "_id": post.authorId })
            .select('email name')
            .exec(function(errSearchUser, author) {
              if (errSearchUser) {
                return next(errSearchUser);
              }

              var postToDisplay = {
                date: post.date,
                title: post.title,
                slug: post.slug,
                contents: post.contents,
                author: author
              };

              return next(null, postToDisplay);
            });
      }, function(errAsync, finalPosts) {
        if (errAsync) {
          return res.status(500).json({
            success: false,
            message: "Error en el async: " + errAsync
          });
        }

        res.json(finalPosts);
      });
    });
});

router.post('/newPost',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
      var newPost = new Post({
        authorId: req.user._id,
        title: req.body.title,
        slug: req.body.slug,
        contents: req.body.contents
      });

      newPost.save(function(errSave) {
        if (errSave) {
          return res.status(500).json({
            success: false,
            message: "Error en la base de datos " + errSave
          });
        }

        res.json({
          success: true,
          message: "Post creado correctamente"
        });
      });
  });

router.get('/:postID([0-z]{24})/comments', function(req, res) {
  Comment
    .find({ "postId": req.params.postID })
    .sort({ "date": -1 })
    // .lean()
    .exec(function(errSearch, comments) {
      if (errSearch) {
        return res.status(500).json({
          success: false,
          message: "Error interno: " + errSearch
        });
      }

      return res.json(comments);
    });
});

router.post('/:postID([0-z]{24})/newComment',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    Post.findOne({ "_id": req.params.postID }, function(errSearch, post) {
      if (errSearch || !post) {
        return res.status(409).json({
          success: false,
          message: "No such post!"
        });
      }

      var newComment = new Comment({
        postId: req.params.postID,
        authorId: req.user._id,
        contents: req.body.contents
      });

      newComment.save(function(errSave) {
        if (errSave) {
          return res.status(500).json({
            success: false,
            message: "Error en la base de datos " + errSave
          });
        }

        res.json({
          success: true,
          message: "Comentario creado correctamente"
        });
      });
    });
  });

module.exports = router;
