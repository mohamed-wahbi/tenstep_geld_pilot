const express = require("express");
const router = express.Router();
const {createMonthlyFinanceCtrl,createAnnualFinanceCtrl,getAnnualFinanceCtrl,deleteOnePredictionResultsCtrl,getMonthlyFinanceCtrl,createPredictionResultsCtrl, getLastPredictionResultsCtrl, getAllPredictionResultsCtrl} = require ('../../controllers/PredictionControllers/predictionControllers.js')


router.route('/monthly-finance/create').post(createMonthlyFinanceCtrl)
router.route('/monthly-finance/getAll').get(getMonthlyFinanceCtrl)


router.route('/annual-finance/create').post(createAnnualFinanceCtrl)
router.route('/annual-finance/getAll').get(getAnnualFinanceCtrl)



router.route('/prediction/create').post(createPredictionResultsCtrl)
router.route('/prediction/get_last_result').get(getLastPredictionResultsCtrl)
router.route('/prediction/get_all_result').get(getAllPredictionResultsCtrl)
router.route('/prediction/deleteOne/:id').delete(deleteOnePredictionResultsCtrl)




module.exports= router