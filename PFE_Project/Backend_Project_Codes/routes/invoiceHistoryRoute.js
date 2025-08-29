const express = require('express');
const router = express.Router();
const {getAllInvoiceHistory} = require ('../controllers/invoiceHistoryController')


// get all clients
router.route("/getAll").get(getAllInvoiceHistory)


module.exports = router;