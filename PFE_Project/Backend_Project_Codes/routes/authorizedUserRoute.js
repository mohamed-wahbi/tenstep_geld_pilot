const express = require("express");
const router = express.Router();
const { createAuthorizationCrtl, deleteOneAuthorizationCrtl, getAllAuthCtrl } = require ("../controllers/authorizedUserController.js")

// create one Authorization :
router.route('/create').post(createAuthorizationCrtl)

// get all authorized Users :
router.route('/get_all').get(getAllAuthCtrl)

// delete one Authorization :
router.route("/delete_one/:id").delete(deleteOneAuthorizationCrtl)

module.exports= router