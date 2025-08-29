const asyncHandler = require("express-async-handler");
const {InvoiceHistory} = require('../models/invoiceHistoryModel')


/*--------------------------------------------------
* @desc    get all Invoice History
* @router  /api/invoice-history/getAll
* @methode GET
* @access  only admin
----------------------------------------------------*/
module.exports.getAllInvoiceHistory = asyncHandler(async(req,res)=> {

    const invoiceHistoryData = await InvoiceHistory.find();
    if(invoiceHistoryData.length === 0) {
        return res.status(400).json({
            message: "No Invoice History in the DB!"
        })
    }

    res.status(200).json({
        invoiceHistoryData
    })
}) 