'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.get('/', (req, res) => {
  User.find({}, (err, users) => {
    res.status(err ? 400 : 200).send(err || users);
  });
});

//   /api/users/register
router.post('/register', (req, res) => {
  User.register(req.body, err => {
    res.status(err ? 400 : 200).send(err || "Successful registration!");
  });
});

router.post('/login', (req, res) => {
  User.authenticate(req.body, (err, token) => {
    if(err) return res.status(400).send(err);

    res.cookie('accessToken', token).send(token);
  });
});

router.delete('/logout', (req, res) => {
  res.clearCookie('accessToken').send();
});

// /api/users/profile
router.get('/profile', User.isLoggedIn, (req, res) => {
  console.log('req.user:', req.user);
  res.send(req.user);
})

// /api/users/profile
router.put('/profile', User.isLoggedIn, (req, res) => {
  User.editProfile(req.user._id, req.body, (err, edtUser) => {
    if(err) return res.status(400).send(err);
    res.send(edtUser);
  })
})

// /api/users/people
router.get('/people', User.isLoggedIn, (req, res) => {
  User
    .find({_id: {$ne: req.user._id}})
    .select({password: false})
    .exec((err, users) => {
      return err ? res.status(400).send(err) : res.send(users);
    });
})

// /api/users/people
router.get('/people/:id', User.isLoggedIn, (req, res) => {
  User.findById(req.params.id).exec((err, user) => {
    return err ? res.status(400).send(err) : res.send(user);
  })
})

// /api/users/people
router.post('/:userId1/friendRequest/:userId2', User.isLoggedIn, (req, res) => {
  User.sendRequest(req.params.userId1, req.params.userId2, (err) => {
    return err ? res.status(400).send(err) : res.send('Friend request sent.');
  })
})

// /api/users/people
router.post('/:userId1/acceptRequest/:userId2', User.isLoggedIn, (req, res) => {
  User.acceptRequest(req.params.userId1, req.params.userId2, (err) => {
    return err ? res.status(400).send(err) : res.send('They\'ve become friends.');
  })
})

// /api/users/people
router.post('/:userId1/removeFriend/:userId2', User.isLoggedIn, (req, res) => {
  User.removeFriend(req.params.userId1, req.params.userId2, (err) => {
    return err ? res.status(400).send(err) : res.send('They\'re no friend anymore.');
  })
})

module.exports = router;
