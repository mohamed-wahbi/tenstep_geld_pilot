const express = require('express');
const {createTestCtrl,deleteTestCtrl,updateTestCtrl} = require('../controllers/testController.js');
const router = express.Router();

router.route("/create").post(createTestCtrl)
router.route("/delete/:id").delete(deleteTestCtrl)
router.route("/update/:id").patch(updateTestCtrl
    
)




module.exports = router;