const express = require('express');
const { getRevenuesCtrl, generateRevCtrl, confirmeRevenueCtrl } = require('../controllers/revenueController');
const router = express.Router();

router.route("/getAll").get(getRevenuesCtrl)

router.route("/generate/:year/:month").post(generateRevCtrl)
router.route("/confirme").post(confirmeRevenueCtrl)



module.exports = router;