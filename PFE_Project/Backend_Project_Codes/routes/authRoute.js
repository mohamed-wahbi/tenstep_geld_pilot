const express = require('express');
const { registerCtel, loginCtrl, getAllUsersCtrl } = require('../controllers/authController.js');
const router = express.Router();

// register route :
router.route('/register').post(registerCtel);

//Login route :
router.route('/login').post(loginCtrl)

// get all users :
router.route("/get_all_users").get(getAllUsersCtrl)




module.exports = router;