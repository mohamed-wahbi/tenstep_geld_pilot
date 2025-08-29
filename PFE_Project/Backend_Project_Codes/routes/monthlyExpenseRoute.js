const express = require('express');
const router = express.Router();
const {createMonthlyExpenseCtrl, getAllMonthlyExpenseCtrl, deleteOneMonthlyExpenseCtrl, updateOneMonthlyExpenseCtrl, createOneManuelyCtrl} = require ('../controllers/monthlyExpenseController.js')

//Create invoice manuele
router.route("/createManuel").post(createOneManuelyCtrl)


//Create invoice auto
router.route("/create").post(createMonthlyExpenseCtrl)

// get all
router.route("/getAll").get(getAllMonthlyExpenseCtrl)

// delete one
router.route("/deleteOne/:id").delete(deleteOneMonthlyExpenseCtrl)

// update one
router.route("/updateOne/:id").put(updateOneMonthlyExpenseCtrl)





module.exports = router;