const asyncHandler = require("express-async-handler");
const {MonthlyExpenseHistory} = require ("../models/MonthlyExpenseHistoryModel.js")




/*--------------------------------------------------
* @desc    Get all Monthly Expense History
* @router  /api/monthly-Expense-history/getAll
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.monthlyExpenseHistoryCtrl = asyncHandler(async(req,res)=> {
    const monthlyExpenseHistory = await MonthlyExpenseHistory.find({})
    
    if(!monthlyExpenseHistory){
        return res.status(400).json({
            message: "No monthly-Expense-history in the DB"
        })
    }

    res.status(200).json({
        monthlyExpenseHistory
    })
})