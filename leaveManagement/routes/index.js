var express = require('express');
var router = express.Router();
var profile = require("../controller/leaveTracker") 
var calender= require("../controller/calender")
/* GET users listing. */
router.get('/leave', profile.leaveTrack);
module.exports = router;
