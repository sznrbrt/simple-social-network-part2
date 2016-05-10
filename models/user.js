'use strict';

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: { type: String },
  github: { type: String },
  facebook: { type: String },
  biography: { type: String },
  profileImg: { type: String },
  website: { type: String },
  friendrequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// IT'S MIDDLEWARE!!
userSchema.statics.isLoggedIn = function(req, res, next) {
  var token = req.cookies.accessToken;

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) return res.status(401).send({error: 'Must be authenticated.'});

    User
      .findById(payload._id)
      .select({password: false})
      .exec((err, user) => {
        if(err || !user) {
          return res.clearCookie('accessToken').status(400).send(err || {error: 'User not found.'});
        }

        req.user = user;
        next();
      })
  });
};

userSchema.statics.sendRequest = function(userId1, userId2, cb) {
  if(userId1 === userId2) {
    return cb({error: "You can't be your own friend!"})
  }
  User.findById(userId1, (err1, user1) => {
    User.findById(userId2, (err2, user2) => {
      if(err1 || err2) if(err1 || err2) return cb(err1 || err2);
      var user2HasFriendReq = user2.friendrequests.indexOf(user1._id) !== -1;

      if(user2HasFriendReq) {
        return cb({error: "Request has been already sent!"});
      }

      user2.friendrequests.push(user1._id);

      user1.save(err => {
        user2.save(err => {
          cb(err1 || err2);
        })
      })
    });
  });
}

userSchema.statics.acceptRequest = function(userId1, userId2, cb) {
  if(userId1 === userId2) {
    return cb({error: "You can't be your own friend!"})
  }
  User.findById(userId1, (err1, user1) => {
    User.findById(userId2, (err2, user2) => {
      if(err1 || err2) if(err1 || err2) return cb(err1 || err2);
      var user1HasFriendReq = user1.friendrequests.indexOf(user2._id) !== -1;
      var idx = user1.friendrequests.indexOf(user2._id);
      if(!user1HasFriendReq) {
        return cb({error: "Error occured, there was no request! Sorry."});
      }

      user1.friendrequests.splice(idx, 1);
      user1.friends.push(user2._id);
      user2.friends.push(user1._id);

      user1.save(err => {
        user2.save(err => {
          cb(err1 || err2);
        })
      })
    });
  });
}

userSchema.statics.removeFriend = function(userId1, userId2, cb) {
  if(userId1 === userId2) {
    return cb({error: "You can't unfriend yourself!"})
  }
  User.findById(userId1, (err1, user1) => {
    User.findById(userId2, (err2, user2) => {
      if(err1 || err2) if(err1 || err2) return cb(err1 || err2);

      var isFriend = user1.friends.indexOf(user2._id) !== -1;
      if(!isFriend) return cb({error: "You aren't friends."});

      var idxUser1 = user1.friends.indexOf(user2._id);
      var idxUser2 = user2.friends.indexOf(user1._id);

      user1.friends.splice(idxUser1, 1);
      user2.friends.splice(idxUser2, 1);

      user1.save(err => {
        user2.save(err => {
          cb(err1 || err2);
        })
      })
    });
  });
}

userSchema.statics.register = function(userObj, cb) {
  this.create(userObj, cb);
};

userSchema.statics.editProfile = function(userId, newUser, cb) {
  User.findByIdAndUpdate(userId, { $set: newUser }, {new: true}, cb);
};

userSchema.statics.authenticate = function(userObj, cb) {
  // find the user by the username
  // confirm the password

  // if user is found, and password is good, create a token
  this.findOne({username: userObj.username}, (err, dbUser) => {
    if(err || !dbUser) return cb(err || { error: 'Login failed. Username or password incorrect.' });

    if(dbUser.password !== userObj.password) {
      return cb({error: 'Login failed. Username or password incorrect.'});
    }

    var token = dbUser.makeToken();

    cb(null, token);
  });
};

userSchema.methods.makeToken = function() {
  var token = jwt.sign({ _id: this._id }, JWT_SECRET);
  return token;
};

var User = mongoose.model('User', userSchema);

module.exports = User;
