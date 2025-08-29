const express = require('express');
const router = express.Router();
const { monthExpensResManuelyCtrl, getAllMonthlyExpenseResultCtrl , confirmAllMonthlyExpenseResults,getAllConfirmedMonthlyExpenseResultCtrl} = require ('../controllers/monthlyExpenseResultController')


//Create
router.route("/generate/:year/:month").post(monthExpensResManuelyCtrl)

//get All not confirmed
router.route("/getAll").get(getAllMonthlyExpenseResultCtrl)

//get All confirmed
router.route("/getAllConfirmed").get(getAllConfirmedMonthlyExpenseResultCtrl)

//confirme All
router.route("/confirmAll").post(confirmAllMonthlyExpenseResults)

module.exports = router;