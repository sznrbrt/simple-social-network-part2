var express = require('express');
var router = express.Router();

var request = require('request');
var qs = require('querystring');
var User = require('../models/user');
var jwt = require('jwt-simple');

//  auth.js
//  /auth  router

router.post('/github', (req, res) => {
  var accessTokenUrl = 'https://github.com/login/oauth/access_token';
  var userApiUrl = 'https://api.github.com/user';

  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    redirect_uri: req.body.redirectUri,
    client_secret: process.env.GITHUB_SECRET
  };

  // use code to request access token
  request.get({ url: accessTokenUrl, qs: params }, (err, response, body) => {
    if(err) return res.status(400).send(err);

    var accessToken = qs.parse(body);
    var headers = { 'User-Agent': 'satellizer' };
    //  use access token to request user profile
    request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, (err, response, profile) => {
      if(err) return res.status(400).send(err);

      User.findOne({ github: profile.id }, (err, existingUser) => {
        if(err) return res.status(400).send(err);
        if(existingUser) {
          var token = existingUser.makeToken();
          res.cookie('accessToken', token).send(existingUser._id);
          // res.send({ token: token });
        } else {
          var user = new User();
          user.github = profile.id;

          user.save((err, savedUser) => {
            var token = savedUser.makeToken();
            res.cookie('accessToken', token).send(savedUser._id);
          });
        }
      });
    });
  });
});

router.post('/facebook', (req, res) => {
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };
  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }
    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      // Step 3. Create a new user account or return an existing one.
      User.findOne({ facebook: profile.id }, function(err, existingUser) {
        if (existingUser) {
          var token = existingUser.makeToken();
          console.log('createdToken:', token);
          return res.cookie('accessToken', token).send(existingUser._id);
        }
        var user = new User();
        user.facebook = profile.id;
        user.profileImg = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
        user.save(function() {
          var token = user.makeToken;
          res.cookie('accessToken', token).send(user._id);
        });
      });
    });
  });
});


module.exports = router;
