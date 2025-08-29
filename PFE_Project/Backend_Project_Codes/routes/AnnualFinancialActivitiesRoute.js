const express = require('express');
const router = express.Router();
const {createAnnualFinancialActivityCtrl, getLatestAnnualFinancialActivityCtrl, getOneAnnualFinancialActivitysCtrl} = require ('../controllers/AnnualFinancialActivitiesController.js')


//Create 
router.route("/create").post(createAnnualFinancialActivityCtrl);

//latest created annual activities 
router.route("/latest").get(getLatestAnnualFinancialActivityCtrl);

//Create 
router.route("/getOne").post(getOneAnnualFinancialActivitysCtrl);

module.exports = router;