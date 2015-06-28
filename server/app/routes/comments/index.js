'use strict';
var router = require('express').Router();
module.exports = router;

router.post('/', function(req, res){
	console.log('hit the post in comments!');
	console.log('is there a req.body?', req.body)
});