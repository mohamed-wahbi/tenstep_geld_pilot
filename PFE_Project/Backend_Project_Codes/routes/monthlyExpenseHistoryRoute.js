const express = require('express');
const router = express.Router();
const {monthlyExpenseHistoryCtrl} = require ('../controllers/monthlyExpenseHistoryController.js')


// get all monthlyExpenseHistoryCtrl
router.route("/getAll").get(monthlyExpenseHistoryCtrl)


module.exports = router;