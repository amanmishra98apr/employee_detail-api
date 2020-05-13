var express = require('express');
var router = express.Router();
var profile = require("../controller/profileController");
var dashboardController = require("../controller/dashboardController") 

/* GET users listing. */
router.post('/employeeprofile/get/', profile.getUserProfile);
router.post('/employeeprofile/edit/', profile.editUserProfile);
router.post('/employeeprofile/add/', profile.addUserProfile);
router.post('/dashboard/', dashboardController.dashboardUserDetails);

module.exports = router;
