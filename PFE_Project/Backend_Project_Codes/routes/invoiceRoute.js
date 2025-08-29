const express = require('express');
const router = express.Router();
const {createInvoiceCtrl, getAllInvoicesCtrl, deleteOneInvoicesCtrl, updateOneInvoicesCtrl} = require('../controllers/invoiceController.js')

//Create invoice
router.route("/create").post(createInvoiceCtrl)

// get all invoices
router.route("/getAll").get(getAllInvoicesCtrl)


// delete one Facture 
router.route("/deleteOne/:id").delete(deleteOneInvoicesCtrl)


// update one Client 
router.route("/updateOne/:id").put(updateOneInvoicesCtrl)


module.exports = router;