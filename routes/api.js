'use strict';

var express = require('express');
var router = express.Router();

// /api/

router.use('/users', require('./users'));

module.exports = router;
