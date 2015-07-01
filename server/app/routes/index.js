'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/tutorial', require('./tutorial'));
router.use('/members', require('./members'));
// router.use('/comments', require('./comments'));
router.use('/highlighted', require('./highlighted'));
router.use('/file', require('./file'));
router.use('/users', require('./users'));
router.use('/git', require('./git'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
