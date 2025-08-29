const express = require('express');
const router = express.Router();
const {createExpenseFixtCtrl,getAllExpenseFixCtrl, getOneExpenseFixCtrl, deleteOneExpenseFixCtrl, updateOneExpenseFixCtrl, getManyExpenseFixCtrl} = require ("../controllers/expenseFixController.js")

//Create ExpenseFix
router.route("/create").post(createExpenseFixtCtrl)

// get all ExpenseFix
router.route("/getAll").get(getAllExpenseFixCtrl)

// get Many ExpenseFix
router.route("/getmany").get(getManyExpenseFixCtrl);


// get one ExpenseFix
router.route("/getOne/:id").get(getOneExpenseFixCtrl)

// delete one ExpenseFix 
router.route("/deleteOne/:id").delete(deleteOneExpenseFixCtrl)


// update one ExpenseFix 
router.route("/updateOne/:id").put(updateOneExpenseFixCtrl)


module.exports = router;