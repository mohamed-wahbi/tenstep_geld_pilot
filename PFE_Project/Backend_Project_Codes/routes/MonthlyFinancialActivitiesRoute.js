const express = require('express');
const router = express.Router();
const {CreateMonthlyFinancialActivitysCtrl, getAllMonthlyFinancialActivitysCtrl,getLatestMonthlyFinancialActivityCtrl,getOneMonthlyFinancialActivitysCtrl} = require ("../controllers/MonthlyFinancialActivitiesController.js")
//Create 
router.route("/create").post(CreateMonthlyFinancialActivitysCtrl)

//Get all 
router.route("/getAll").get(getAllMonthlyFinancialActivitysCtrl)

//Get latest
router.route("/latest").get(getLatestMonthlyFinancialActivityCtrl)


//Get one
router.route("/getOne").post(getOneMonthlyFinancialActivitysCtrl)



module.exports = router;